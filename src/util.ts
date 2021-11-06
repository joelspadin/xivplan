import { Vector2d } from 'konva/lib/types';

export function asArray<T>(x: T | readonly T[]): readonly T[] {
    return Array.isArray(x) ? x : [x];
}

export function clamp(x: number, min: number, max: number): number {
    return Math.min(Math.max(x, min), max);
}

export function degtorad(deg: number): number {
    return (deg * Math.PI) / 180;
}

export function radtodeg(rad: number): number {
    return (rad / Math.PI) * 180;
}

export function distance(a: Vector2d, b?: Vector2d): number {
    const h = a.x - (b?.x ?? 0);
    const v = a.y - (b?.y ?? 0);

    return Math.sqrt(h * h + v * v);
}

export function rotateArray<T>(items: readonly T[], offset: number): T[] {
    offset = ((offset % items.length) + items.length) % items.length;

    return [...items.slice(offset), ...items.slice(0, offset)];
}

export function* reversed<T>(items: readonly T[]): Generator<T> {
    for (let i = items.length - 1; i >= 0; i--) {
        yield items[i] as T;
    }
}

export function makeClassName(classes: Record<string, boolean>): string {
    return Object.entries(classes)
        .filter(([, value]) => value)
        .map(([key]) => key)
        .join(' ');
}

export function* mapIter<T, U>(iter: Iterable<T>, func: (item: T) => U): Generator<U> {
    for (const item of iter) {
        yield func(item);
    }
}

export function mapSet<T, U>(set: ReadonlySet<T>, func: (item: T) => U): Set<U> {
    return new Set(mapIter(set, func));
}

export function omit<T, K extends keyof T>(obj: T, omitKey: K): Omit<T, K> {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => key !== omitKey)) as Omit<T, K>;
}

type HasOptionalBool<T, K extends keyof T> = T[K] extends boolean | undefined ? T : never;

export function setOrOmit<T, K extends keyof T>(obj: HasOptionalBool<T, K>, key: K, value: boolean): T {
    if (value) {
        return { ...obj, [key]: value };
    }
    return omit(obj, key) as HasOptionalBool<T, K>;
}
