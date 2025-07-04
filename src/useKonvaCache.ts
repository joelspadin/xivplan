/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-hooks/exhaustive-deps */
import { Node } from 'konva/lib/Node';
import { DependencyList, useLayoutEffect, useMemo } from 'react';

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
export function useKonvaCache(ref: React.RefObject<Node>, deps: DependencyList): void;
/**
 * Caches the given Konva node, refreshing the cache whenever the dependencies change.
 *
 * @param ref Ref to the node to cache
 * @param options Configuration for caching, as well as whether caching should be enabled
 * @param deps Dependency list
 */
export function useKonvaCache(ref: React.RefObject<Node>, options: UseKonvaCacheOptions, deps: DependencyList): void;
export function useKonvaCache(
    ref: React.RefObject<Node>,
    configOrDeps: UseKonvaCacheOptions | DependencyList,
    maybeDeps?: DependencyList,
) {
    const [enabled, config, deps] = useOptions(configOrDeps, maybeDeps);

    useLayoutEffect(() => {
        if (enabled) {
            ref.current?.cache(config);
        } else {
            ref.current?.clearCache();
        }
    }, [enabled, config, ref.current, ...deps]);
}

function useOptions(optionsOrDeps: UseKonvaCacheOptions | DependencyList, deps?: DependencyList) {
    return useMemo<[boolean, CacheConfig | undefined, DependencyList]>(() => {
        if (typeof optionsOrDeps === 'object') {
            const { enabled, ...config } = optionsOrDeps as UseKonvaCacheOptions;

            return [enabled ?? true, config, deps ?? []];
        }

        return [true, undefined, optionsOrDeps];
    }, [optionsOrDeps, deps]);
}
