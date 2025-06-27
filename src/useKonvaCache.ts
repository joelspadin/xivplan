/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-hooks/exhaustive-deps */
import { Node } from 'konva/lib/Node';
import { DependencyList, useLayoutEffect } from 'react';

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

    useLayoutEffect(() => {
        if (enabled) {
            ref.current?.cache();
        } else {
            ref.current?.clearCache();
        }
    }, [enabled, ref.current, ...deps]);
}
