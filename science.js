// Dimensionless teaching models. These are not fitted chemical kinetics.
export function amplifiedEE(inputEE, strength) {
  const e = Math.max(-100, Math.min(100, inputEE));
  const p = (1 + e / 100) / 2;
  const a = p ** strength, b = (1 - p) ** strength;
  return (2 * a / (a + b) - 1) * 100;
}

export function createReaction(seedEE = 2) {
  const e = Math.max(-100, Math.min(100, seedEE));
  return { a: 10 * (1 + e / 100), b: 10 * (1 - e / 100), substrate: 200, round: 0 };
}

export function reactionStep(state) {
  if (state.substrate <= 0) return { ...state };
  const amount = Math.min(10, state.substrate);
  // Both original products persist; substrate is converted into new products.
  const share = state.a ** 2 / (state.a ** 2 + state.b ** 2);
  return { a: state.a + amount * share, b: state.b + amount * (1 - share), substrate: state.substrate - amount, round: state.round + 1 };
}

export function composition(state) {
  const total = state.a + state.b;
  const fractionA = state.a / total;
  return { fractionA, signedEE: (2 * fractionA - 1) * 100, ee: Math.abs(2 * fractionA - 1) * 100 };
}
