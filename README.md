# rational-fraction-from-decimal

Finds the best rational approximation to a decimal value using continued-fraction expansion with a denominator bound.

```js
import { fromDecimal } from 'rational-fraction-from-decimal';

const { numerator, denominator } = fromDecimal(Math.PI, 113);
// numerator === 355, denominator === 113
```

`fromDecimal(value, maxDenominator)` returns `{ numerator, denominator }`. The denominator is always positive and never exceeds `maxDenominator`. The numerator carries the sign. Both fields are integers.

## Why this exists

When you need a fraction that represents a decimal — for display, for exact arithmetic, or for a domain that only admits rationals — you want the closest fraction subject to a denominator you can live with. Continued fractions produce the sequence of best rational approximations to a real number in order of increasing denominator, so stopping at the first convergent that would breach the bound leaves you with the optimal answer at or below that bound.

The trade-off: the result is the best single fraction under the bound, not a fraction chosen for shortness of decimal representation. `0.1` yields `1/10`, not `1/9`, even though both have the same digit count. If you want "shortest fraction that rounds back to the input", that is a different problem and a different library.

## Edge cases

- `value = 0` (or values smaller than `1e-15` in absolute terms) returns `0/1`.
- Integer inputs return themselves over `1`.
- Negative inputs produce a negative numerator and a positive denominator.
- `NaN` and `Infinity` throw `TypeError`; a non-integer or sub-unit `maxDenominator` also throws.
- A `maxDenominator` of `1` forces integer rounding: `2.7` becomes `3/1`.

The algorithm relies on floating-point arithmetic, so for decimals that are not exactly representable (such as `0.1`) the approximation tracks the double actually stored, not the decimal literal you typed. This is rarely visible at modest bounds but is the reason `fromDecimal(0.1, 100)` returns `1/10` only because `1/10` is the convergent closest to the stored double.
