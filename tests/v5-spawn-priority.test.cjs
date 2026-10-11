const test = require('node:test');
const assert = require('node:assert/strict');
const { MULTIPLIERS, weightFor, choose } = require('../寶可夢3D-V5/js/spawn-priority.js');

test('never-caught creatures become much more common than capped creatures', () => {
  const state = { captureCounts: {new: 0, collecting: 1, capped: 3}, hasReachedLimit: {} };
  assert.equal(weightFor('new', state), MULTIPLIERS.uncaught);
  assert.equal(weightFor('collecting', state), MULTIPLIERS.collecting);
  assert.equal(weightFor('capped', state), MULTIPLIERS.completed);
  assert.equal(weightFor('new', state) / weightFor('capped', state), 40);
});

test('rarity weights and unlock flags are respected', () => {
  const state = { captureCounts: {raichu: 0, pikachu: 3}, pokedexUnlocks: {raichu: false}, hasReachedLimit: {pikachu: true} };
  assert.equal(weightFor('raichu', state, {raichu: 0.15}), 1.2);
  assert.equal(weightFor('pikachu', state), 0.2);
  assert.equal(weightFor('legacy-capped', {captureCounts: {'legacy-capped': 1}, hasReachedLimit: {'legacy-capped': true}}), 0.2);
});

test('weighted roll honors supplied eligible pool, including boundaries', () => {
  const state = {captureCounts: {rare: 3}};
  assert.equal(choose(['rare', 'new'], state, {}, 3, () => 0), 'rare');
  assert.equal(choose(['rare', 'new'], state, {}, 3, () => 0.5), 'new');
  assert.equal(choose(['rare', 'new'], state, {}, 3, () => 1), 'new');
  assert.equal(choose(['only'], state, {}, 3, () => 0.2), 'only');
  assert.equal(choose([], state), null);
});

test('invalid counts and base rarity do not break the encounter roll', () => {
  assert.equal(weightFor('a', {captureCounts: {a: -10}}, {a: 0}), 8);
  assert.equal(weightFor('a', {captureCounts: {a: NaN}}, {a: Infinity}), 8);
  assert.equal(weightFor('a', {pokedexUnlocks: {a: true}}), 2);
  assert.equal(choose(['a', 'b'], {}, {}, 3, () => NaN), 'a');
});
