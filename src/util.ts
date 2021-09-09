export function getUrl(url: string | URL, base?: string | URL | undefined): string {
    return new URL(url, base).toString();
}

export function* reversed<T>(items: T[]): Generator<T> {
    for (let i = items.length - 1; i >= 0; i--) {
        yield items[i] as T;
    }
}
