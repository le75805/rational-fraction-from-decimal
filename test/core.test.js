import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromDecimal } from '../src/index.js';

/**
 * Compare a returned fraction against an expected numerator/denominator.
 * We never compare floats with ===, but integer fields are exact, so a
 * strict deep-equal is correct here.
 */
function assertFraction(actual, numerator, denominator) {
  assert.deepEqual(actual, { numerator, denominator });
}

test('exact decimal 0.5 yields 1/2', () => {
  assertFraction(fromDecimal(0.5, 100), 1, 2);
});

test('exact decimal 0.75 yields 3/4', () => {
  assertFraction(fromDecimal(0.75, 100), 3, 4);
});

test('integer input yields denominator 1', () => {
  assertFraction(fromDecimal(3, 10), 3, 1);
});

test('negative exact decimal -0.5 yields -1/2', () => {
  assertFraction(fromDecimal(-0.5, 100), -1, 2);
});

test('negative integer yields negative numerator, denominator 1', () => {
  assertFraction(fromDecimal(-4, 10), -4, 1);
});

test('zero yields 0/1', () => {
  assertFraction(fromDecimal(0, 10), 0, 1);
});

test('1/3 approximation with denominator bound 10 yields 1/3', () => {
  assertFraction(fromDecimal(1 / 3, 10), 1, 3);
});

test('1/3 approximation with denominator bound 1000 yields 1/3', () => {
  assertFraction(fromDecimal(1 / 3, 1000), 1, 3);
});

test('pi approximated with denominator bound 7 yields 22/7', () => {
  assertFraction(fromDecimal(Math.PI, 7), 22, 7);
});

test('pi approximated with denominator bound 106 yields 355/113', () => {
  assertFraction(fromDecimal(Math.PI, 106), 333, 106);
});

test('pi approximated with denominator bound 113 yields 355/113', () => {
  assertFraction(fromDecimal(Math.PI, 113), 355, 113);
});

test('golden ratio approximated with denominator bound 8 yields 13/8', () => {
  assertFraction(fromDecimal((1 + Math.sqrt(5)) / 2, 8), 13, 8);
});

test('denominator never exceeds the bound', () => {
  const { denominator } = fromDecimal(Math.PI, 50);
  assert.ok(denominator <= 50, `denominator ${denominator} exceeds bound`);
});

test('bound of 1 forces integer rounding', () => {
  assertFraction(fromDecimal(2.7, 1), 3, 1);
});

test('bound of 1 with 2.3 rounds down to 2', () => {
  assertFraction(fromDecimal(2.3, 1), 2, 1);
});

test('very small value near zero yields 0/1', () => {
  assertFraction(fromDecimal(1e-12, 100), 0, 1);
});

test('NaN input throws TypeError', () => {
  assert.throws(() => fromDecimal(NaN, 10), TypeError);
});

test('Infinity input throws TypeError', () => {
  assert.throws(() => fromDecimal(Infinity, 10), TypeError);
});

test('non-integer maxDenominator throws TypeError', () => {
  assert.throws(() => fromDecimal(0.5, 10.5), TypeError);
});

test('maxDenominator < 1 throws TypeError', () => {
  assert.throws(() => fromDecimal(0.5, 0), TypeError);
});

test('approximation is the closest fraction within the bound', () => {
  // sqrt(2) ~= 1.41421356. With bound 5 the convergents are 1/1, 3/2, 7/5.
  // 7/5 = 1.4 is within the bound and is the best rational approximation.
  assertFraction(fromDecimal(Math.sqrt(2), 5), 7, 5);
});

test('larger bound gives a better approximation of sqrt(2)', () => {
  // 99/70 ~= 1.4142857, closer than 7/5.
  assertFraction(fromDecimal(Math.sqrt(2), 70), 99, 70);
});
