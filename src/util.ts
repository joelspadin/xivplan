export function asArray<T>(x: T | readonly T[]): readonly T[] {
    return Array.isArray(x) ? x : [x];
}

export function degtorad(deg: number): number {
    return (deg * Math.PI) / 180;
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
