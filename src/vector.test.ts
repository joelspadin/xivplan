import type { Vector2d } from 'konva/lib/types';
import { describe, expect, test } from 'vitest';
import {
    distance,
    getDistanceFromLine,
    getIntersectionDistance,
    intersect,
    vecAdd,
    vecAngle,
    vecAtAngle,
    vecDot,
    vecEqual,
    vecMult,
    vecNormal,
    vecProject,
    vecSub,
    vecUnit,
} from './vector';

function v(x: number, y: number): Vector2d {
    return { x, y };
}

const SQRT2 = 0.7071067811865475;

describe('vecEqual', () => {
    test('returns true if equal', () => {
        expect(vecEqual(v(0, 0), v(0, 0))).toBe(true);
        expect(vecEqual(v(1, 2), v(1, 2))).toBe(true);
    });

    test('returns false if not equal', () => {
        expect(vecEqual(v(0, 0), v(0, 1))).toBe(false);
        expect(vecEqual(v(1, 2), v(0, 2))).toBe(false);
    });
});

describe('vecSub', () => {
    test('returns vector difference', () => {
        expect(vecSub(v(2, 3), v(1, 2))).toEqual(v(1, 1));
        expect(vecSub(v(0, 0), v(1, -1))).toEqual(v(-1, 1));
    });
});

describe('vecAdd', () => {
    test('returns vector sum', () => {
        expect(vecAdd(v(2, 3), v(1, 2))).toEqual(v(3, 5));
        expect(vecAdd(v(0, 0), v(1, -1))).toEqual(v(1, -1));
    });
});

describe('vecMult', () => {
    test('returns vector scaled by factor', () => {
        expect(vecMult(v(1, 2), 2)).toEqual(v(2, 4));
        expect(vecMult(v(1, 2), 0.5)).toEqual(v(0.5, 1));
        expect(vecMult(v(1, 2), -1)).toEqual(v(-1, -2));
    });
});

describe('vecDot', () => {
    test('returns dot product between two vectors', () => {
        expect(vecDot(v(0, 0), v(0, 0))).toEqual(0);
        expect(vecDot(v(0, 0), v(1, 2))).toEqual(0);
        expect(vecDot(v(1, 2), v(0, 0))).toEqual(0);
        expect(vecDot(v(1, 2), v(2, 3))).toEqual(8);
        expect(vecDot(v(-2, 3), v(4, -1))).toEqual(-11);
    });
});

describe('distance', () => {
    test('returns distance between two points', () => {
        expect(distance(v(0, 0), v(0, 0))).toBe(0);
        expect(distance(v(1, 0), v(1, 2))).toBe(2);
        expect(distance(v(1, 1), v(2, 2))).toBeCloseTo(Math.sqrt(2), 5);
    });
});

describe('vecUnit', () => {
    test('returns unit vector in direction', () => {
        expect(vecUnit(v(2, 0))).toEqual(v(1, 0));
        expect(vecUnit(v(0.5, 0))).toEqual(v(1, 0));

        expect(vecUnit(v(0, 2))).toEqual(v(0, 1));
        expect(vecUnit(v(0, 0.5))).toEqual(v(0, 1));

        expect(vecUnit(v(-1, -1))).toEqual(v(-SQRT2, -SQRT2));
    });

    test('return (0, 0) if value is (0, 0)', () => {
        expect(vecUnit(v(0, 0))).toEqual(v(0, 0));
    });
});

describe('vecAngle', () => {
    test('returns vector direction in degrees', () => {
        // Up is 0, positive is clockwise
        expect(vecAngle(v(0, 1))).toBe(0);
        expect(vecAngle(v(1, 1))).toBe(45);
        expect(vecAngle(v(1, 0))).toBe(90);
        expect(vecAngle(v(1, -1))).toBe(135);
        expect(vecAngle(v(0, -1))).toBe(180);
        expect(vecAngle(v(-1, -1))).toBe(225);
        // Values aren't normalized to [0, 360)
        expect(vecAngle(v(-1, 0))).toBe(-90);
        expect(vecAngle(v(-1, 1))).toBe(-45);
    });

    test('returns 0 for (0, 0)', () => {
        expect(vecAngle(v(0, 0))).toBe(0);
    });
});

function vecCloseTo(x: number, y: number) {
    const expectedDiff = 10 ** -5 / 2;

    return (received: Vector2d) => {
        const xDiff = Math.abs(x - received.x);
        const yDiff = Math.abs(y - received.y);

        return xDiff < expectedDiff && yDiff < expectedDiff;
    };
}

describe('vecAtAngle', () => {
    test('returns unit vector in direction', () => {
        // Up is 0, positive is clockwise
        expect(vecAtAngle(0)).toSatisfy(vecCloseTo(0, 1));
        expect(vecAtAngle(45)).toSatisfy(vecCloseTo(SQRT2, SQRT2));
        expect(vecAtAngle(90)).toSatisfy(vecCloseTo(1, 0));
        expect(vecAtAngle(135)).toSatisfy(vecCloseTo(SQRT2, -SQRT2));
        expect(vecAtAngle(180)).toSatisfy(vecCloseTo(0, -1));
        expect(vecAtAngle(225)).toSatisfy(vecCloseTo(-SQRT2, -SQRT2));
        expect(vecAtAngle(270)).toSatisfy(vecCloseTo(-1, 0));
        expect(vecAtAngle(315)).toSatisfy(vecCloseTo(-SQRT2, SQRT2));
    });
});

describe('vecNormal', () => {
    test('returns vector at right angle', () => {
        expect(vecNormal(v(1, 0))).toSatisfy(vecCloseTo(0, 1));
        expect(vecNormal(v(0, 1))).toSatisfy(vecCloseTo(-1, 0));
        expect(vecNormal(v(-2, 0))).toSatisfy(vecCloseTo(0, -2));
        expect(vecNormal(v(0, -2))).toSatisfy(vecCloseTo(2, 0));

        expect(vecNormal(v(1, 1))).toEqual(v(-1, 1));
    });

    test('returns (0, 0) for (0, 0)', () => {
        expect(vecNormal(v(0, 0))).toSatisfy(vecCloseTo(0, 0));
    });
});

describe('getIntersectionDistance', () => {
    test('returns distance if lines intersect', () => {
        const p1 = v(1, 1);
        const u1 = v(0, 1);
        const p2 = v(0, 4);
        const u2 = v(1, 0);

        expect(getIntersectionDistance(p1, u1, p2, u2)).toBe(3);
    });

    test('returns undefined if lines are parallel', () => {
        const p1 = v(1, 1);
        const u1 = v(0, 1);
        const p2 = v(0, 4);
        const u2 = v(0, 1);

        expect(getIntersectionDistance(p1, u1, p2, u2)).toBeUndefined();
    });
});

describe('intersect', () => {
    test('returns intersection point if lines intersect', () => {
        const p1 = v(1, 1);
        const u1 = v(0, 1);
        const p2 = v(0, 4);
        const u2 = v(1, 0);

        expect(intersect(p1, u1, p2, u2)).toSatisfy(vecCloseTo(1, 4));
    });

    test('returns undefined if lines are parallel', () => {
        const p1 = v(1, 1);
        const u1 = v(0, 1);
        const p2 = v(0, 4);
        const u2 = v(0, 1);

        expect(intersect(p1, u1, p2, u2)).toBeUndefined();
    });
});

describe('getDistanceFromLine', () => {
    const numDigits = 5;

    test('returns distance to closest point on line', () => {
        const start = v(0, 2);
        const end = v(2, 0);

        expect(getDistanceFromLine(start, end, v(3, -1))).toBeCloseTo(0, numDigits);
        expect(getDistanceFromLine(start, end, v(2, 0))).toBeCloseTo(0, numDigits);
        expect(getDistanceFromLine(start, end, v(1, 1))).toBeCloseTo(0, numDigits);
        expect(getDistanceFromLine(start, end, v(0, 2))).toBeCloseTo(0, numDigits);
        expect(getDistanceFromLine(start, end, v(-1, 3))).toBeCloseTo(0, numDigits);

        expect(getDistanceFromLine(start, end, v(-1, 1))).toBeCloseTo(SQRT2 * 2, numDigits);
        expect(getDistanceFromLine(start, end, v(0, 0))).toBeCloseTo(SQRT2 * 2, numDigits);
        expect(getDistanceFromLine(start, end, v(2, 2))).toBeCloseTo(SQRT2 * 2, numDigits);
        expect(getDistanceFromLine(start, end, v(3, 1))).toBeCloseTo(SQRT2 * 2, numDigits);
    });

    test('returns NaN if start and end are equal', () => {
        expect(getDistanceFromLine(v(0, 0), v(0, 0), v(1, 1))).toBeNaN();
    });
});

describe('vecProject', () => {
    test('returns the projection of a onto b', () => {
        // Parallel vectors
        expect(vecProject(v(1, 1), v(1, 1))).toEqual(v(1, 1));
        expect(vecProject(v(1, 1), v(2, 2))).toEqual(v(1, 1));
        expect(vecProject(v(2, 2), v(1, 1))).toEqual(v(2, 2));
        expect(vecProject(v(1, 1), v(-1, -1))).toEqual(v(1, 1));
        expect(vecProject(v(-3, -3), v(1, 1))).toEqual(v(-3, -3));

        // Perpendicular vectors
        expect(vecProject(v(-1, 1), v(1, 1))).toEqual(v(0, 0));

        // ~arbitrary vectors
        expect(vecProject(v(-1, 5), v(4, 6))).toEqual(v(2, 3));
        expect(vecProject(v(0, 6), v(6, 2))).toSatisfy(vecCloseTo(1.8, 0.6));
    });

    test('returns (0,0) if the target vector is of length 0', () => {
        expect(vecProject(v(1, 2), v(0, 0))).toEqual(v(0, 0));
        expect(vecProject(v(-2, 3), v(0, 0))).toEqual(v(0, 0));
        expect(vecProject(v(-3, -1), v(0, 0))).toEqual(v(0, 0));
    });
});
