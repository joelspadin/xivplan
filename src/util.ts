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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
