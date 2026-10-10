(function attachPokemonGameRuntime(globalObject) {
    const TRANSIENT_VISUAL_KEY = '__pokemonTransientVisualBase';
    const SPECIAL_POKEMON_TYPES = Object.freeze([
        'pikachu', 'charizard', 'wigglytuff', 'blissey',
        'dialga', 'palkia', 'giratina', 'arceus',
    ]);
    const SPECIAL_POKEMON_TYPE_SET = new Set(SPECIAL_POKEMON_TYPES);
    const BALL_CATCH_RATES = Object.freeze({
        normal: Object.freeze({ ordinary: 0.75, special: 0.45 }),
        great: Object.freeze({ ordinary: 0.95, special: 0.70 }),
        master: 0.99,
        berryBonus: 0.15,
        nonMasterCap: 0.95,
    });

    const cloneRuntimeMaterial = (material) => {
        if (!material || typeof material.clone !== 'function') return material;
        const cloned = material.clone();
        cloned.userData = { ...(material.userData || {}), ...(cloned.userData || {}) };
        delete cloned.userData[TRANSIENT_VISUAL_KEY];
        return cloned;
    };

    const cloneRuntimeGLBScene = (sourceScene) => {
        const clone = sourceScene.clone(true);
        clone.traverse((node) => {
            if (!node.isMesh || !node.material) return;
            node.material = Array.isArray(node.material)
                ? node.material.map(cloneRuntimeMaterial)
                : cloneRuntimeMaterial(node.material);
        });
        return clone;
    };

    const eachMaterial = (root, callback) => {
        if (!root || typeof root.traverse !== 'function') return;
        root.traverse((node) => {
            if (!node.isMesh || !node.material) return;
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach((material) => callback(material));
        });
    };

    const applyTransientEmissive = (root, color, minimumIntensity = 1) => {
        eachMaterial(root, (material) => {
            if (!material.emissive || typeof material.emissive.getHex !== 'function') return;
            material.userData = material.userData || {};
            if (!material.userData[TRANSIENT_VISUAL_KEY]) {
                material.userData[TRANSIENT_VISUAL_KEY] = {
                    emissive: material.emissive.getHex(),
                    emissiveIntensity: Number.isFinite(material.emissiveIntensity) ? material.emissiveIntensity : 1,
                };
            }
            material.emissive.setHex(color);
            if ('emissiveIntensity' in material) {
                material.emissiveIntensity = Math.max(minimumIntensity, material.emissiveIntensity || 0);
            }
        });
    };

    const restoreTransientEmissive = (root) => {
        eachMaterial(root, (material) => {
            const base = material.userData && material.userData[TRANSIENT_VISUAL_KEY];
            if (!base || !material.emissive || typeof material.emissive.setHex !== 'function') return;
            material.emissive.setHex(base.emissive);
            if ('emissiveIntensity' in material) material.emissiveIntensity = base.emissiveIntensity;
            delete material.userData[TRANSIENT_VISUAL_KEY];
        });
    };

    const isLockTargetAvailable = (target) => Boolean(
        target
        && !target.isCaptured
        && !target.isDead
        && target.mesh
        && target.mesh.position
        && target.mesh.parent
    );

    const getLockPriority = (target) => {
        if (!target) return -Infinity;
        if (Number.isFinite(target.lockPriority)) return target.lockPriority;
        return target.isSpecialTarget || target.isLegendary ? 100 : 0;
    };

    const getCaptureHitRadius = (target) => {
        if (!target) return 0.85;
        const scale = Number.isFinite(target.baseScale) ? target.baseScale : 1;
        if (target.isSpecialTarget) return Math.max(1.8, scale * 1.2);
        if (target.isLegendary) return Math.max(1.5, scale * 0.9);
        return Math.max(0.85, scale * 0.72);
    };

    const getCaptureBodyCenter = (target) => {
        const position = target?.mesh?.position || target?.position || {};
        const offset = target?.captureCenterOffset || {};
        const scale = Number.isFinite(target?.baseScale) ? target.baseScale : 1;
        const fallbackHeight = Math.max(0.65, Math.min(2.4, scale * 0.9));
        return {
            x: Number(position.x) || 0,
            y: (Number(position.y) || 0) + (Number.isFinite(offset.y) ? offset.y : fallbackHeight),
            z: Number(position.z) || 0,
        };
    };

    const segmentIntersectsSphere = (from, to, center, radius) => {
        if (!from || !to || !center || !Number.isFinite(Number(radius))) return false;
        const dx = (Number(to.x) || 0) - (Number(from.x) || 0);
        const dy = (Number(to.y) || 0) - (Number(from.y) || 0);
        const dz = (Number(to.z) || 0) - (Number(from.z) || 0);
        const lengthSquared = dx * dx + dy * dy + dz * dz;
        const cx = (Number(center.x) || 0) - (Number(from.x) || 0);
        const cy = (Number(center.y) || 0) - (Number(from.y) || 0);
        const cz = (Number(center.z) || 0) - (Number(from.z) || 0);
        const projection = lengthSquared > 0
            ? Math.max(0, Math.min(1, (cx * dx + cy * dy + cz * dz) / lengthSquared))
            : 0;
        const nearestX = (Number(from.x) || 0) + dx * projection;
        const nearestY = (Number(from.y) || 0) + dy * projection;
        const nearestZ = (Number(from.z) || 0) + dz * projection;
        const distanceX = nearestX - (Number(center.x) || 0);
        const distanceY = nearestY - (Number(center.y) || 0);
        const distanceZ = nearestZ - (Number(center.z) || 0);
        return distanceX * distanceX + distanceY * distanceY + distanceZ * distanceZ <= Number(radius) ** 2;
    };

    const resolveAssistedThrowVelocity = ({
        start,
        target,
        power = 0.5,
        gravity = -12,
        minimumSpeed = 12,
        maximumSpeed = 18,
    } = {}) => {
        if (!start || !target) return null;
        const dx = (Number(target.x) || 0) - (Number(start.x) || 0);
        const dz = (Number(target.z) || 0) - (Number(start.z) || 0);
        const horizontalDistance = Math.hypot(dx, dz);
        if (horizontalDistance < 0.01) return null;
        const normalizedPower = Math.max(0, Math.min(1, Number(power) || 0));
        const speed = minimumSpeed + (maximumSpeed - minimumSpeed) * normalizedPower;
        const flightTime = Math.max(0.45, Math.min(1.25, horizontalDistance / speed));
        return {
            x: dx / flightTime,
            y: ((Number(target.y) || 0) - (Number(start.y) || 0) - 0.5 * gravity * flightTime * flightTime) / flightTime,
            z: dz / flightTime,
            flightTime,
        };
    };

    const getCaptureStandOffDistance = () => 12;

    const resolveLockApproachState = ({ target, distance, tolerance = 0.35 }) => {
        if (!isLockTargetAvailable(target) || !Number.isFinite(Number(distance))) {
            return { direction: 0, desiredDistance: null };
        }
        const desiredDistance = getCaptureStandOffDistance(target);
        const numericDistance = Number(distance);
        if (numericDistance > desiredDistance + tolerance) return { direction: 1, desiredDistance };
        if (numericDistance < desiredDistance - tolerance) return { direction: -1, desiredDistance };
        return { direction: 0, desiredDistance };
    };

    const getLockApproachSpeed = ({ distance, desiredDistance, multiplier = 1.5 }) => {
        const gap = Math.abs(Number(distance) - Number(desiredDistance));
        const speedMultiplier = Math.max(0, Number(multiplier) || 0);
        return Math.min(7.2 * speedMultiplier, Math.max(4.8 * speedMultiplier, gap * 1.4 * speedMultiplier));
    };

    const orderLockTargets = (targets, distanceTo) => targets
        .filter(isLockTargetAvailable)
        .map((target, index) => ({
            target,
            index,
            priority: getLockPriority(target),
            distance: Number(distanceTo(target)) || 0,
        }))
        .sort((a, b) => b.priority - a.priority || a.distance - b.distance || a.index - b.index)
        .map((entry) => entry.target);

    const orderCycleLockTargets = (targets, distanceTo) => targets
        .filter(isLockTargetAvailable)
        .map((target, index) => ({
            target,
            index,
            priority: getLockPriority(target),
            distance: Number(distanceTo(target)) || 0,
            sequence: Number.isFinite(target.lockSequence) ? target.lockSequence : null,
        }))
        .sort((a, b) => {
            const priorityDifference = b.priority - a.priority;
            if (priorityDifference) return priorityDifference;
            if (a.sequence !== null && b.sequence !== null) return a.sequence - b.sequence;
            return a.distance - b.distance || a.index - b.index;
        })
        .map((entry) => entry.target);

    const resolveAutoLockState = ({
        enabled,
        currentTarget = null,
        targets = [],
        distanceTo = () => 0,
        forceTarget = null,
        cycle = false,
        preserveCurrent = false,
    }) => {
        if (!enabled && !forceTarget) return { autoLock: false, lockedTarget: null };

        const ordered = orderLockTargets(targets, distanceTo);
        const cycleOrdered = orderCycleLockTargets(targets, distanceTo);
        if (isLockTargetAvailable(forceTarget)) {
            return { autoLock: true, lockedTarget: forceTarget };
        }
        if (ordered.length === 0) {
            return { autoLock: true, lockedTarget: null };
        }

        const currentIsValid = isLockTargetAvailable(currentTarget) && ordered.includes(currentTarget);
        if (cycle && currentIsValid) {
            const index = cycleOrdered.indexOf(currentTarget);
            return { autoLock: true, lockedTarget: cycleOrdered[(index + 1) % cycleOrdered.length] };
        }
        if (!currentIsValid) {
            return { autoLock: true, lockedTarget: ordered[0] };
        }

        const preferred = ordered[0];
        return {
            autoLock: true,
            lockedTarget: preserveCurrent
                ? currentTarget
                : (getLockPriority(preferred) > getLockPriority(currentTarget) ? preferred : currentTarget),
        };
    };

    const shouldSpawnGymReward = ({ cleared, captured = false, captureCount = 0, alreadyActive = false }) => Boolean(
        cleared
        && !captured
        && Number(captureCount) === 0
        && !alreadyActive
    );

    const isSpecialPokemonType = (type) => SPECIAL_POKEMON_TYPE_SET.has(type);

    const resolveSpecialCaptureMap = ({
        specialPokemonCaptured = {},
        captureCounts = {},
        pokedexUnlocks = {},
        gymRewardCaptured = {},
    } = {}) => Object.fromEntries(SPECIAL_POKEMON_TYPES.map((type) => [
        type,
        Boolean(
            specialPokemonCaptured[type]
            || Number(captureCounts[type]) > 0
            || pokedexUnlocks[type]
            || gymRewardCaptured[type]
        ),
    ]));

    const shouldSpawnSpecialPokemon = ({
        type,
        triggered = true,
        alreadyActive = false,
        specialPokemonCaptured = {},
        captureCounts = {},
        pokedexUnlocks = {},
        gymRewardCaptured = {},
    }) => {
        if (!isSpecialPokemonType(type) || !triggered || alreadyActive) return false;
        const normalized = resolveSpecialCaptureMap({ specialPokemonCaptured, captureCounts, pokedexUnlocks, gymRewardCaptured });
        return !normalized[type];
    };

    const resolveCaptureOutcome = ({ type, previousCount = 0, maxCaptureLimit = 3 }) => {
        const isSpecial = isSpecialPokemonType(type);
        return {
            isSpecial,
            nextCount: isSpecial ? 1 : Math.min(Number(maxCaptureLimit) || 3, (Number(previousCount) || 0) + 1),
            shouldRespawn: !isSpecial,
        };
    };

    const getModeLockTargets = ({ mode = 'world', activeBoss = null, worldTargets = [] } = {}) => {
        if (String(mode).startsWith('gym')) return isLockTargetAvailable(activeBoss) ? [activeBoss] : [];
        return worldTargets.filter(isLockTargetAvailable);
    };

    const resolveWorldFeedTarget = ({
        berryCount = 0,
        currentTarget = null,
    }) => {
        if (Number(berryCount) <= 0) return null;
        if (isLockTargetAvailable(currentTarget) && !currentTarget.berryFed) return currentTarget;
        return null;
    };

    const resolveCatchRate = ({
        type = '',
        isSpecial = false,
        isMasterBall = false,
        isGreatBall = false,
        berryFed = false,
    } = {}) => {
        if (isMasterBall) return BALL_CATCH_RATES.master;
        const special = Boolean(isSpecial || isSpecialPokemonType(type));
        const ballRates = isGreatBall ? BALL_CATCH_RATES.great : BALL_CATCH_RATES.normal;
        const baseRate = special ? ballRates.special : ballRates.ordinary;
        const berryBonus = berryFed ? BALL_CATCH_RATES.berryBonus : 0;
        return Math.min(BALL_CATCH_RATES.nonMasterCap, baseRate + berryBonus);
    };

    globalObject.PokemonGameRuntime = Object.freeze({
        cloneRuntimeGLBScene,
        applyTransientEmissive,
        restoreTransientEmissive,
        isLockTargetAvailable,
        getLockPriority,
        getCaptureHitRadius,
        getCaptureBodyCenter,
        segmentIntersectsSphere,
        resolveAssistedThrowVelocity,
        getCaptureStandOffDistance,
        resolveLockApproachState,
        getLockApproachSpeed,
        orderLockTargets,
        orderCycleLockTargets,
        resolveAutoLockState,
        shouldSpawnGymReward,
        SPECIAL_POKEMON_TYPES,
        isSpecialPokemonType,
        resolveSpecialCaptureMap,
        shouldSpawnSpecialPokemon,
        resolveCaptureOutcome,
        getModeLockTargets,
        resolveWorldFeedTarget,
        BALL_CATCH_RATES,
        resolveCatchRate,
    });
})(typeof window !== 'undefined' ? window : globalThis);
