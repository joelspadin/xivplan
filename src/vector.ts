import { Vector2d } from 'konva/lib/types';
import { degtorad, radtodeg } from './util';

export const VEC_ZERO: Vector2d = { x: 0, y: 0 };

export function vecEqual(a: Vector2d, b: Vector2d): boolean {
    return a.x === b.x && a.y === b.y;
}

export function vecSub(a: Vector2d, b: Vector2d): Vector2d {
    return { x: a.x - b.x, y: a.y - b.y };
}

export function vecAdd(a: Vector2d, b: Vector2d): Vector2d {
    return { x: a.x + b.x, y: a.y + b.y };
}

export function vecMult(v: Vector2d, d: number): Vector2d {
    return { x: v.x * d, y: v.y * d };
}

export function distance(a: Vector2d, b?: Vector2d): number {
    const v = b ? vecSub(a, b) : a;
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function vecUnit(v: Vector2d): Vector2d {
    const d = distance(v);
    if (d === 0) {
        return v;
    }

    return { x: v.x / d, y: v.y / d };
}

export function vecAngle(v: Vector2d): number {
    return 90 - radtodeg(Math.atan2(v.y, v.x));
}

export function vecAtAngle(deg: number): Vector2d {
    const rad = degtorad(90 - deg);
    return {
        x: Math.cos(rad),
        y: Math.sin(rad),
    };
}

export function vecNormal(v: Vector2d): Vector2d {
    return { x: -v.y, y: v.x };
}

/**
 * Find the distance from p1 to the intersection point between two rays.
 * @param p1 Point on ray 1
 * @param u1 Unit vector in direction of ray 1
 * @param p2 Point on ray 2
 * @param u2 Unit vector in direction of ray 2
 */
export function getIntersectionDistance(p1: Vector2d, u1: Vector2d, p2: Vector2d, u2: Vector2d): number | undefined {
    const difference = vecSub(p2, p1);
    const n1 = vecNormal(u1);

    const qx = difference.x * u1.x + difference.y * u1.y;
    const qy = difference.x * n1.x + difference.y * n1.y;

    const sx = u2.x * u1.x + u2.y * u1.y;
    const sy = u2.x * n1.x + u2.y * n1.y;

    if (sy === 0) {
        return undefined;
    }

    return qx - (qy * sx) / sy;
}

/**
 * Find the intersection point between two rays.
 * @param p1 Point on ray 1
 * @param u1 Unit vector in direction of ray 1
 * @param p2 Point on ray 2
 * @param u2 Unit vector in direction of ray 2
 */
export function intersect(p1: Vector2d, u1: Vector2d, p2: Vector2d, u2: Vector2d): Vector2d | undefined {
    const a = getIntersectionDistance(p1, u1, p2, u2);

    return a ? vecAdd(p1, vecMult(u1, a)) : undefined;
}

/**
 * Find the distance from q to the closest point on a line from p1 to p2.
 * @param p1 Start point of line.
 * @param p2 End point of line.
 * @param q Target point.
 */
export function getDistanceFromLine(p1: Vector2d, p2: Vector2d, q: Vector2d) {
    return (
        Math.abs((p2.y - p1.y) * q.x - (p2.x - p1.x) * q.y + p2.x * p1.y - p2.y * p1.x) /
        Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2))
    );
}
