import { Vector2d } from 'konva/lib/types';
import { radtodeg } from './util';

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
    return { x: v.x / d, y: v.y / d };
}

export function vecAngle(v: Vector2d): number {
    return 90 - radtodeg(Math.atan2(v.y, v.x));
}
