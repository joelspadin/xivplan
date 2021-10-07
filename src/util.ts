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
