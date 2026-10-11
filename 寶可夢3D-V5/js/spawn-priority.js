/* V5 wild encounter priorities; story, gym and legendary spawns stay separate. */
(function (root) {
  'use strict';
  const MULTIPLIERS = Object.freeze({ uncaught: 8, collecting: 2, completed: 0.2 });

  function weightFor(id, state = {}, baseWeights = {}, captureLimit = 3) {
    const raw = Number(baseWeights[id]);
    const base = Number.isFinite(raw) && raw > 0 ? raw : 1;
    const rawCount = Number(state.captureCounts?.[id]);
    const count = Number.isFinite(rawCount) ? Math.max(0, Math.floor(rawCount)) : 0;
    const completed = state.hasReachedLimit?.[id] === true || count >= captureLimit;
    const caught = count > 0 || state.pokedexUnlocks?.[id] === true;
    const multiplier = completed ? MULTIPLIERS.completed : caught ? MULTIPLIERS.collecting : MULTIPLIERS.uncaught;
    return base * multiplier;
  }

  function choose(pool, state = {}, baseWeights = {}, captureLimit = 3, random = Math.random) {
    if (!Array.isArray(pool) || pool.length === 0) return null;
    const weights = pool.map(id => weightFor(id, state, baseWeights, captureLimit));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const roll = Number(random());
    let remaining = (Number.isFinite(roll) ? Math.min(1 - Number.EPSILON, Math.max(0, roll)) : 0) * total;
    for (let i = 0; i < pool.length; i++) {
      remaining -= weights[i];
      if (remaining < 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  const api = Object.freeze({ MULTIPLIERS, weightFor, choose });
  root.V5SpawnPriority = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
