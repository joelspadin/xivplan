/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-hooks/exhaustive-deps */
import { Node } from 'konva/lib/Node';
import { DependencyList, useEffect, useState } from 'react';

export function useKonvaCache(ref: React.RefObject<Node>, deps: DependencyList): void;
export function useKonvaCache(ref: React.RefObject<Node>, enabled: boolean, deps: DependencyList): void;
export function useKonvaCache(
    ref: React.RefObject<Node>,
    enabledOrDeps: boolean | DependencyList,
    deps?: DependencyList,
) {
    let enabled = true;

    if (typeof enabledOrDeps === 'boolean') {
        enabled = enabledOrDeps;
        deps = deps ?? [];
    } else {
        deps = enabledOrDeps;
    }

    // On changes to dependencies, immediately clear the cache to avoid a flicker
    // where the object draws with its old cached appearance.
    const [prevRef, setPrevRef] = useState(ref.current);
    const [prevDeps, setPrevDeps] = useState(deps);

    if (ref.current !== prevRef) {
        setPrevRef(ref.current);
        ref.current?.clearCache();
    }

    if (!depsEqual(prevDeps, deps)) {
        setPrevDeps(deps);
        ref.current?.clearCache();
    }

    // Then re-cache the object after it has been drawn.
    useEffect(() => {
        if (enabled) {
            ref.current?.cache();
        }
    }, [enabled, ref.current, ...deps]);
}

function depsEqual(prevDeps: DependencyList, nextDeps: DependencyList) {
    if (prevDeps.length !== nextDeps.length) {
        return false;
    }

    return prevDeps.every((dep, i) => dep === nextDeps[i]);
}
