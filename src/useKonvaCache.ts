/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-hooks/exhaustive-deps */
import { Node } from 'konva/lib/Node';
import { DependencyList, useEffect, useState } from 'react';

type CacheOptions = Exclude<Parameters<Node['cache']>[0], undefined>;
export function useKonvaCache(ref: React.RefObject<Node>, deps: DependencyList): void;
export function useKonvaCache(ref: React.RefObject<Node>, enabled: boolean, deps: DependencyList): void;
export function useKonvaCache(ref: React.RefObject<Node>, options: CacheOptions, deps: DependencyList): void;
export function useKonvaCache(
    ref: React.RefObject<Node>,
    enabledOrOptionsOrDeps: boolean | CacheOptions | DependencyList,
    deps?: DependencyList,
) {
    let enabled = true;
    let options: CacheOptions | undefined;

    if (typeof enabledOrOptionsOrDeps === 'boolean') {
        enabled = enabledOrOptionsOrDeps;
        deps = deps ?? [];
    } else if (Array.isArray(enabledOrOptionsOrDeps)) {
        deps = enabledOrOptionsOrDeps;
    } else {
        options = enabledOrOptionsOrDeps as CacheOptions;
        deps = deps ?? [];
    }

    // On changes to dependencies, immediately clear the cache to avoid a flicker
    // where the object draws with its old cached appearance.
    const [prevRef, setPrevRef] = useState(ref.current);
    const [prevOptions, setPrevOptions] = useState(options);
    const [prevDeps, setPrevDeps] = useState(deps);
    const [prevEnabled, setPrevEnabled] = useState(enabled);

    if (ref.current !== prevRef) {
        setPrevRef(ref.current);
        ref.current?.clearCache();
    }

    if (options !== prevOptions) {
        setPrevOptions(options);
        ref.current?.clearCache();
    }

    if (!depsEqual(prevDeps, deps)) {
        setPrevDeps(deps);
        ref.current?.clearCache();
    }

    if (enabled !== prevEnabled) {
        setPrevEnabled(enabled);
        ref.current?.clearCache();
    }

    // Then re-cache the object after it has been drawn.
    useEffect(() => {
        if (enabled) {
            ref.current?.cache(options);
        }
    }, [enabled, options, ref.current, ...deps]);
}

function depsEqual(prevDeps: DependencyList, nextDeps: DependencyList) {
    if (prevDeps.length !== nextDeps.length) {
        return false;
    }

    return prevDeps.every((dep, i) => dep === nextDeps[i]);
}
