/**
 * Rational Fraction From Decimal core implementation.
 *
 * The algorithm is a continued-fraction expansion of the input value,
 * terminating as soon as the next convergent's denominator exceeds the
 * caller-supplied bound. The last convergent within the bound is the best
 * rational approximation at that denominator limit, in the sense that no
 * other fraction with a denominator at or below the bound is closer to the
 * target. This is a classical result; see Hardy & Wright, An Introduction
 * to the Theory of Numbers, ch. X.
 */

/**
 * @typedef {Object} Fraction
 * @property {number} numerator   Integer numerator (signed).
 * @property {number} denominator Denominator, always positive and <= maxDenominator.
 */

/**
 * A zero guard: if the input rounds to exactly zero within the epsilon used
 * for the integer-part check, we short-circuit to 0/1. Without this, a tiny
 * positive value like 1e-12 would produce a spurious 0/1 anyway after the
 * first floor step, but doing it explicitly makes the intent obvious and
 * keeps negative-zero behaviour consistent.
 */
function isEffectivelyZero(x) {
  return Math.abs(x) < 1e-15;
}

/**
 * Compute the best rational approximation to `value` whose denominator does
 * not exceed `maxDenominator`, using continued-fraction convergents.
 *
 * We pick off the integer part first so that the CF loop only ever sees a
 * value in [0, 1). This keeps the reciprocal growing and avoids loss of
 * precision from subtracting two close large numbers inside the loop.
 *
 * The loop runs until the fractional part is ~0 or the next denominator
 * would breach the bound. On bound breach we keep the previous convergent
 * — it is guaranteed to be within the bound and is the closest such fraction.
 *
 * @param {number} value          The decimal to approximate. May be negative.
 * @param {number} maxDenominator Strict upper bound for the denominator (>= 1).
 * @returns {Fraction}
 * @throws {TypeError} If maxDenominator is not a finite integer >= 1, or
 *                     value is not finite.
 */
export function fromDecimal(value, maxDenominator) {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    throw new TypeError('value must be finite');
  }
  if (!Number.isInteger(maxDenominator) || maxDenominator < 1) {
    throw new TypeError('maxDenominator must be an integer >= 1');
  }

  if (isEffectivelyZero(value)) {
    return { numerator: 0, denominator: 1 };
  }

  const negative = value < 0;
  let rest = Math.abs(value);

  // Integer part handled up front so the CF loop starts in [0, 1).
  const integerPart = Math.floor(rest);
  rest -= integerPart;

  // Convergents h_{k}/k_{k}. We seed with the two classical initial values
  // h_{-1}=1, k_{-1}=0  and  h_0=a_0, k_0=1.
  let prevNum = 1;
  let prevDen = 0;
  let num = integerPart;
  let den = 1;

  // Limit iterations defensively: 64 partial quotients give astronomically
  // fine resolution for doubles and prevents an infinite loop on a
  // pathological input that never hits the stopping condition due to
  // floating-point noise.
  const MAX_ITERATIONS = 64;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    // rest is in [0, 1). If it is effectively zero, the current convergent
    // is exact and we stop.
    if (isEffectivelyZero(rest)) {
      break;
    }

    const reciprocal = 1 / rest;
    const a = Math.floor(reciprocal);
    const nextFractional = reciprocal - a;

    const nextNum = a * num + prevNum;
    const nextDen = a * den + prevDen;

    if (nextDen > maxDenominator) {
      // The next convergent would breach the bound; the current one is the
      // best we are allowed to use.
      break;
    }

    prevNum = num;
    prevDen = den;
    num = nextNum;
    den = nextDen;
    rest = nextFractional;
  }

  const numerator = negative ? -num : num;
  return { numerator, denominator: den };
}
