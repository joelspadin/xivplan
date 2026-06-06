import { describe, expect, test } from 'vitest';
import * as util from './util';

describe('asArray', () => {
    test('returns original value for array', () => {
        const arr = [1, 2, 3];
        expect(util.asArray(arr)).toBe(arr);
    });

    test('returns single item array for value', () => {
        expect(util.asArray(1)).toEqual([1]);
    });
});

describe('clamp', () => {
    const min = 1;
    const max = 3;

    test('returns original value if in bounds', () => {
        expect(util.clamp(1, min, max)).toBe(1);
        expect(util.clamp(2, min, max)).toBe(2);
        expect(util.clamp(3, min, max)).toBe(3);
    });

    test('returns min if value < min', () => {
        expect(util.clamp(0, min, max)).toBe(min);
    });

    test('returns max if value > min', () => {
        expect(util.clamp(4, min, max)).toBe(max);
    });
});

describe('degtorad', () => {
    const numDigits = 5;

    test('converts degrees to radians', () => {
        expect(util.degtorad(0)).toBeCloseTo(0, numDigits);
        expect(util.degtorad(90)).toBeCloseTo(Math.PI / 2, numDigits);
        expect(util.degtorad(180)).toBeCloseTo(Math.PI, numDigits);
        expect(util.degtorad(270)).toBeCloseTo((Math.PI * 3) / 2, numDigits);
        expect(util.degtorad(360)).toBeCloseTo(Math.PI * 2, numDigits);
    });
});

describe('radtodeg', () => {
    const numDigits = 5;

    test('converts radians to degrees', () => {
        expect(util.radtodeg(0)).toBeCloseTo(0, numDigits);
        expect(util.radtodeg(Math.PI / 2)).toBeCloseTo(90, numDigits);
        expect(util.radtodeg(Math.PI)).toBeCloseTo(180, numDigits);
        expect(util.radtodeg((Math.PI * 3) / 2)).toBeCloseTo(270, numDigits);
        expect(util.radtodeg(Math.PI * 2)).toBeCloseTo(360, numDigits);
    });
});

describe('mod360', () => {
    test('returns original value for value in [0, 359]', () => {
        expect(util.mod360(0)).toBe(0);
        expect(util.mod360(180)).toBe(180);
        expect(util.mod360(359)).toBe(359);
    });

    test('returns value modulo 360 for value > 360', () => {
        expect(util.mod360(360)).toBe(0);
        expect(util.mod360(540)).toBe(180);
        expect(util.mod360(719)).toBe(359);
        expect(util.mod360(720)).toBe(0);
        expect(util.mod360(1080)).toBe(0);
    });

    test('returns positive value modulo 360 for value < 0', () => {
        expect(util.mod360(-1)).toBe(359);
        expect(util.mod360(-180)).toBe(180);
        expect(util.mod360(-360)).toBe(0);
        expect(util.mod360(-720)).toBe(0);
    });
});

describe('clampRotation', () => {
    test('returns original value for value in [-179, 180]', () => {
        expect(util.clampRotation(-179)).toBe(-179);
        expect(util.clampRotation(-90)).toBe(-90);
        expect(util.clampRotation(0)).toBe(0);
        expect(util.clampRotation(90)).toBe(90);
        expect(util.clampRotation(180)).toBe(180);
    });

    test('returns value modulo 360 centered at 0 for outside [-179, 180]', () => {
        expect(util.clampRotation(-180)).toBe(180);
        expect(util.clampRotation(-270)).toBe(90);
        expect(util.clampRotation(-360)).toBe(0);
        expect(util.clampRotation(-361)).toBe(-1);

        expect(util.clampRotation(181)).toBe(-179);
        expect(util.clampRotation(270)).toBe(-90);
        expect(util.clampRotation(360)).toBe(0);
        expect(util.clampRotation(361)).toBe(1);
    });
});

describe('rotateArray', () => {
    test('returns original array if offset is 0', () => {
        expect(util.rotateArray([1, 2, 3], 0)).toEqual([1, 2, 3]);
    });

    test('returns array rotated left if offset is > 0', () => {
        expect(util.rotateArray([1, 2, 3], 1)).toEqual([2, 3, 1]);
        expect(util.rotateArray([1, 2, 3], 2)).toEqual([3, 1, 2]);
        expect(util.rotateArray([1, 2, 3], 3)).toEqual([1, 2, 3]);
    });

    test('returns array rotated right if offset is < 0', () => {
        expect(util.rotateArray([1, 2, 3], -1)).toEqual([3, 1, 2]);
        expect(util.rotateArray([1, 2, 3], -2)).toEqual([2, 3, 1]);
        expect(util.rotateArray([1, 2, 3], -3)).toEqual([1, 2, 3]);
    });

    test('does not modify original array', () => {
        const arr = [1, 2, 3];

        expect(util.rotateArray(arr, 1)).toEqual([2, 3, 1]);
        expect(arr).toEqual([1, 2, 3]);
    });
});

describe('combinations', () => {
    function combinations<T>(items: readonly T[]): [T, T][] {
        return [...util.combinations(items)];
    }

    test('yields nothing for empty array', () => {
        expect(combinations([])).toEqual([]);
    });

    test('yields all unique pairs of values from array', () => {
        expect(combinations([1, 2, 3])).toEqual([
            [1, 2],
            [1, 3],
            [2, 3],
        ]);
    });
});

describe('isNotNull', () => {
    test('returns true if not null and not undefined', () => {
        expect(util.isNotNull(0)).toBe(true);
        expect(util.isNotNull('')).toBe(true);
    });

    test('returns false for null or undefined', () => {
        expect(util.isNotNull(null)).toBe(false);
        expect(util.isNotNull(undefined)).toBe(false);
    });

    // Compile time check that the type guard works.

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function acceptsNumberOnly(x: number) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function acceptsNullOnly(x: null | undefined) {}

    const value: number | null | undefined = 1;
    if (util.isNotNull(value)) {
        acceptsNumberOnly(value);
    } else {
        acceptsNullOnly(value);
    }
});

describe('reversed', () => {
    function reversed<T>(items: readonly T[]): T[] {
        return [...util.reversed(items)];
    }

    test('yields nothing for empty array', () => {
        expect(reversed([])).toEqual([]);
    });

    test('yields reversed items', () => {
        expect(reversed([1, 2, 3])).toEqual([3, 2, 1]);
    });

    test('does not modify original array', () => {
        const arr = [1, 2, 3];

        expect(reversed(arr)).toEqual([3, 2, 1]);
        expect(arr).toEqual([1, 2, 3]);
    });
});

interface Test {
    a: number;
    b?: number;
    c?: number;
    d?: boolean;
}

describe('omit', () => {
    test('returns object with key removed', () => {
        const obj: Test = { a: 1, b: 2, c: 3 };
        expect(util.omit(obj, 'b')).toEqual({ a: 1, c: 3 });
    });

    test('does nothing if key not present', () => {
        const obj: Test = { a: 1, b: 2 };
        expect(util.omit(obj, 'c')).toEqual({ a: 1, b: 2 });
    });

    test('does not modify original object', () => {
        const obj: Test = { a: 1, b: 2, c: 3 };
        expect(util.omit(obj, 'b')).toEqual({ a: 1, c: 3 });
        expect(obj).toEqual({ a: 1, b: 2, c: 3 });
    });
});

describe('setOrOmit', () => {
    test('returns object with key set if value is not undefined or false', () => {
        const obj: Test = { a: 1 };
        expect(util.setOrOmit(obj, 'b', 0)).toEqual({ a: 1, b: 0 });
        expect(util.setOrOmit(obj, 'c', 1)).toEqual({ a: 1, c: 1 });
        expect(util.setOrOmit(obj, 'd', true)).toEqual({ a: 1, d: true });
    });

    test('returns object with key omitted if value is undefined or false', () => {
        const obj: Test = { a: 1, b: 0, d: true };
        expect(util.setOrOmit(obj, 'b', undefined)).toEqual({ a: 1, d: true });
        expect(util.setOrOmit(obj, 'd', undefined)).toEqual({ a: 1, b: 0 });
        expect(util.setOrOmit(obj, 'd', false)).toEqual({ a: 1, b: 0 });
    });

    test('does not modify original object', () => {
        const obj: Test = { a: 1, b: 2 };
        expect(util.setOrOmit(obj, 'b', undefined)).toEqual({ a: 1 });
        expect(obj).toEqual({ a: 1, b: 2 });
    });
});

describe('commonValue', () => {
    function getA(obj: Test) {
        return obj.a;
    }
    function getB(obj: Test) {
        return obj.b;
    }

    test('returns undefined if array is empty', () => {
        expect(util.commonValue([], getA)).toBeUndefined();
    });

    test('returns common value if all values are equal', () => {
        const objects1: Test[] = [{ a: 1 }];
        const objects2: Test[] = [{ a: 2 }, { a: 2 }];
        const objects3: Test[] = [{ a: 3 }, { a: 3 }, { a: 3 }];

        expect(util.commonValue(objects1, getA)).toBe(1);
        expect(util.commonValue(objects2, getA)).toBe(2);
        expect(util.commonValue(objects3, getA)).toBe(3);
    });

    test('returns undefined if any values differ', () => {
        const objects1: Test[] = [{ a: 1 }, { a: 2 }];
        const objects2: Test[] = [{ a: 1, b: 1 }, { a: 2, b: 1 }, { a: 3 }];

        expect(util.commonValue(objects1, getA)).toBeUndefined();
        expect(util.commonValue(objects2, getA)).toBeUndefined();
        expect(util.commonValue(objects2, getB)).toBeUndefined();
    });
});

describe('getUrlFileExtension', () => {
    test('returns file extension from URL path', () => {
        expect(util.getUrlFileExtension('https://foo.bar/yep.png')).toBe('.png');
        expect(util.getUrlFileExtension('https://foo.bar/yep.png#nope.jpg')).toBe('.png');
        expect(util.getUrlFileExtension('https://foo.bar/yep.png?q=nope.jpg')).toBe('.png');
    });

    test('returns empty string if URL has no file extension', () => {
        expect(util.getUrlFileExtension('https://foo.bar')).toBe('');
        expect(util.getUrlFileExtension('https://foo.bar/image')).toBe('');
    });

    test('returns empty string if input is not a valid URL', () => {
        expect(util.getUrlFileExtension('')).toBe('');
        expect(util.getUrlFileExtension('foo.bar')).toBe('');
    });
});

describe('removeFileExtension', () => {
    test('returns string with file extension removed', () => {
        expect(util.removeFileExtension('yep.png')).toBe('yep');
        expect(util.removeFileExtension('util.test.ts')).toBe('util');
    });

    test('returns original value if value has no file extension', () => {
        expect(util.removeFileExtension('yep')).toBe('yep');
    });
});

describe('makeDisplayName', () => {
    test('returns string with whitespace converted to PascalCase', () => {
        expect(util.makeDisplayName('Acceleration bomb 1')).toBe('AccelerationBomb1');
    });
});

describe('round', () => {
    const numDigits = 5;

    test('returns float rounded to step', () => {
        expect(util.round(1)).toBeCloseTo(1, numDigits);
        expect(util.round(1.1)).toBeCloseTo(1, numDigits);
        expect(util.round(1.5)).toBeCloseTo(2, numDigits);
        expect(util.round(2)).toBeCloseTo(2, numDigits);

        expect(util.round(1.1, 0.5)).toBeCloseTo(1, numDigits);
        expect(util.round(1.6, 0.5)).toBeCloseTo(1.5, numDigits);

        expect(util.round(0.8, 2)).toBeCloseTo(0, numDigits);
        expect(util.round(1, 2)).toBeCloseTo(2, numDigits);
        expect(util.round(1.6, 2)).toBeCloseTo(2, numDigits);
    });

    test('returns Vector2d rounded to step', () => {
        expect(util.round({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 });
        expect(util.round({ x: 1.1, y: 1.8 })).toEqual({ x: 1, y: 2 });
        expect(util.round({ x: 1.5, y: 2.5 })).toEqual({ x: 2, y: 3 });

        expect(util.round({ x: 1.1, y: 1.6 }, 0.5)).toEqual({ x: 1, y: 1.5 });
        expect(util.round({ x: 0.8, y: 1.8 }, 0.5)).toEqual({ x: 1, y: 2 });

        expect(util.round({ x: 1, y: 1.6 }, 2)).toEqual({ x: 2, y: 2 });
        expect(util.round({ x: 0.8, y: 1.8 }, 2)).toEqual({ x: 0, y: 2 });
    });
});

describe('factionDigitsToStep', () => {
    const numDigits = 5;

    test('returns step for rounding to number of decimal places', () => {
        expect(util.fractionDigitsToStep(0)).toBe(1);
        expect(util.fractionDigitsToStep(1)).toBeCloseTo(0.1, numDigits);
        expect(util.fractionDigitsToStep(2)).toBeCloseTo(0.01, numDigits);
        expect(util.fractionDigitsToStep(3)).toBeCloseTo(0.001, numDigits);
    });
});

describe('formatNumber', () => {
    test('returns number as string rounded and with trailing zeroes removed', () => {
        expect(util.formatNumber(0)).toBe('0');
        expect(util.formatNumber(1.23456)).toBe('1.23');
        expect(util.formatNumber(1.23456, 3)).toBe('1.235');
        expect(util.formatNumber(1.23456, 4)).toBe('1.2346');
        expect(util.formatNumber(1.23456, 5)).toBe('1.23456');
        expect(util.formatNumber(1.23456, 6)).toBe('1.23456');
    });

    test('returns empty string for null or undefined', () => {
        expect(util.formatNumber(null)).toBe('');
        expect(util.formatNumber(undefined)).toBe('');
    });
});

describe('getLinearGridDivs', () => {
    test('returns evenly spaced divisions inside range', () => {
        expect(util.getLinearGridDivs(5, 0, 10)).toEqual([2, 4, 6, 8]);
        expect(util.getLinearGridDivs(5, -1, 10)).toEqual([1, 3, 5, 7]);

        expect(util.getLinearGridDivs(3, 0, 9)).toEqual([3, 6]);
        expect(util.getLinearGridDivs(3, 1, 9)).toEqual([4, 7]);

        expect(util.getLinearGridDivs(2, 0, 4)).toEqual([2]);
        expect(util.getLinearGridDivs(2, 1, 4)).toEqual([3]);
    });

    test('returns empty array for < 2 divisions', () => {
        expect(util.getLinearGridDivs(1, 0, 10)).toEqual([]);
        expect(util.getLinearGridDivs(0, 0, 10)).toEqual([]);
    });

    test('returns start value if distance is 0', () => {
        expect(util.getLinearGridDivs(5, 1, 0)).toEqual([1, 1, 1, 1]);
    });
});
