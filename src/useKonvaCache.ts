import { Node } from 'konva/lib/Node';
import { type DependencyList, useLayoutEffect } from 'react';

type CacheConfig = Exclude<Parameters<Node['cache']>[0], undefined>;

export type UseKonvaCacheOptions = CacheConfig & {
    enabled?: boolean;
};

/**
 * Caches the given Konva node, refreshing the cache whenever the dependencies change.
 *
 * @param ref Ref to the node to cache
 * @param deps Dependency list
 */
export function useKonvaCache(ref: React.RefObject<Node | null>, deps: DependencyList): void;
/**
 * Caches the given Konva node, refreshing the cache whenever the dependencies change.
 *
 * @param ref Ref to the node to cache
 * @param options Configuration for caching, as well as whether caching should be enabled
 * @param deps Dependency list
 */
export function useKonvaCache(
    ref: React.RefObject<Node | null>,
    options: UseKonvaCacheOptions,
    deps: DependencyList,
): void;
export function useKonvaCache(
    ref: React.RefObject<Node | null>,
    configOrDeps: UseKonvaCacheOptions | DependencyList,
    maybeDeps?: DependencyList,
) {
    const [enabled, config, deps] = getOptions(configOrDeps, maybeDeps);

    useLayoutEffect(() => {
        if (enabled) {
            tryCache(ref.current, config);
        } else {
            ref.current?.clearCache();
        }
    }, [enabled, config, ref, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}

function getOptions(
    optionsOrDeps: UseKonvaCacheOptions | DependencyList,
    deps?: DependencyList,
): [boolean, CacheConfig | undefined, DependencyList] {
    if (typeof optionsOrDeps === 'object') {
        const { enabled, ...config } = optionsOrDeps as UseKonvaCacheOptions;

        return [enabled ?? true, config, deps ?? []];
    }

    return [true, undefined, optionsOrDeps];
}

function tryCache(node: Node | null, config: CacheConfig | undefined) {
    try {
        node?.cache(config);
    } catch {
        // Konva may fail to cache if the size is 0. Ignore that.
    }
}
