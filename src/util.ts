export function* reversed<T>(items: T[]): Generator<T> {
    for (let i = items.length - 1; i >= 0; i--) {
        yield items[i] as T;
    }
}
