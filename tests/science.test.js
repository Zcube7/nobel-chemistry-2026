import test from 'node:test';
import assert from 'node:assert/strict';
import { amplifiedEE, createReaction, reactionStep, composition } from '../dist/science.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('linear reference, exact balance and pure limits remain correct', () => {
  for (const e of [-100, -20, 0, 2, 50, 100]) close(amplifiedEE(e, 1), e);
  for (const a of [1, 2, 3, 5]) {
    close(amplifiedEE(0, a), 0);
    close(amplifiedEE(100, a), 100);
    close(amplifiedEE(-100, a), -100);
  }
});

test('nonlinear curve is bounded, monotone and symmetric between mirror partners', () => {
  for (const a of [1.1, 2, 3, 5]) {
    let previous = -100;
    for (let e = -100; e <= 100; e++) {
      const value = amplifiedEE(e, a);
      assert.ok(value >= previous - 1e-9 && value >= -100 && value <= 100);
      close(value, -amplifiedEE(-e, a));
      if (e > 0 && e < 100) assert.ok(value > e);
      previous = value;
    }
  }
});

test('reaction conserves material, never consumes catalysts, and stops at depleted substrate', () => {
  for (const e of [-100, -20, -2, 0, 2, 20, 100]) {
    let state = createReaction(e);
    for (let i = 0; i < 20; i++) {
      const next = reactionStep(state);
      close(next.a + next.b + next.substrate, 220);
      assert.ok(next.a >= state.a && next.b >= state.b && next.substrate >= 0);
      state = next;
    }
    assert.equal(state.substrate, 0);
    assert.equal(state.round, 20);
    assert.deepEqual(reactionStep(state), state);
  }
});

test('balanced seed never chooses a side; exchanging the seed exchanges the outcome', () => {
  let balanced = createReaction(0), left = createReaction(2), right = createReaction(-2);
  for (let i = 0; i < 20; i++) {
    balanced = reactionStep(balanced); left = reactionStep(left); right = reactionStep(right);
    close(composition(balanced).ee, 0);
    close(left.a, right.b); close(left.b, right.a);
  }
  assert.ok(composition(left).ee > 2 && composition(left).ee < 100);
});

test('ee and majority percentage are distinct quantities', () => {
  close(composition({a:51, b:49}).ee, 2);
  close(composition({a:90, b:10}).ee, 80);
  close(composition({a:99, b:1}).ee, 98);
});
