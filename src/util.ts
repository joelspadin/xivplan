import { Vector2d } from 'konva/lib/types';

export function asArray<T>(x: Readonly<T> | readonly T[]): readonly T[] {
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

export function mod360(deg: number): number {
    return ((deg % 360) + 360) % 360;
}

export function rotateArray<T>(items: readonly T[], offset: number): T[] {
    offset = ((offset % items.length) + items.length) % items.length;

    return [...items.slice(offset), ...items.slice(0, offset)];
}

export function* combinations<T>(items: readonly T[]): Generator<[T, T]> {
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            yield [items[i]!, items[j]!];
        }
    }
}

export function isNotNull<T>(x: T | null | undefined): x is T {
    return x !== null && x !== undefined;
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

export function omit<T extends object, K extends keyof T>(obj: T, omitKey: K): Omit<T, K> {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => key !== omitKey)) as Omit<T, K>;
}

type HasOptionalBool<T, K extends keyof T> = T[K] extends boolean | undefined ? T : never;

export function setOrOmit<T extends object, K extends keyof T>(obj: HasOptionalBool<T, K>, key: K, value: boolean): T {
    if (value) {
        return { ...obj, [key]: value };
    }
    return omit(obj, key) as HasOptionalBool<T, K>;
}

export function commonValue<T, U>(objects: readonly T[], value: (object: T) => U): U | undefined {
    if (objects[0] === undefined) {
        return undefined;
    }

    const first = value(objects[0]);
    return objects.every((obj) => value(obj) === first) ? first : undefined;
}

export function removeFileExtension(path: string) {
    return path.replace(/\..+?$/, '');
}

export function makeDisplayName(name: string) {
    name = name.trim();
    name = name.charAt(0).toUpperCase() + name.substring(1);
    return name.replaceAll(/\s+(.)/g, (_, c: string) => c.toUpperCase());
}

export function round(value: number, multiple?: number): number;
export function round(value: Vector2d, multiple?: number): Vector2d;
export function round(value: number | Vector2d, multiple = 1) {
    if (typeof value === 'number') {
        return Math.round(value / multiple) * multiple;
    }

    return {
        x: round(value.x, multiple),
        y: round(value.y, multiple),
    };
}

export function getLinearGridDivs(divs: number, start: number, distance: number) {
    return Array.from({ length: divs - 1 }, (_, i) => start + ((i + 1) / divs) * distance);
}
