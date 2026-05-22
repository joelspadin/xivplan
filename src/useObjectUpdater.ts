import { useCallback } from 'react';
import type { SceneObject } from './scene';
import { useScene } from './SceneProvider';
import { useObjectIds } from './useObjectIds';
import type { OptionalBooleanKeys, OptionalKeys } from './util';

export interface ObjectUpdaterAction<T> {
    props?: Partial<T>;
    omit?: readonly OptionalKeys<T>[];
    transient?: boolean;
}

export type ObjectUpdater<T extends SceneObject> = (update: ObjectUpdaterAction<T>) => void;

/**
 * Returns a function which dispatches a 'updateProps' action for the given objects when called.
 *
 * This can be used instead of dispatching an 'update' action to prevent callback functions from
 * needing to change every time unrelated object properties are changed.
 */
export function useObjectUpdater<T extends SceneObject>(
    objects: readonly T[],
): (action: ObjectUpdaterAction<T>) => void {
    const { dispatch } = useScene();
    const ids = useObjectIds(objects);

    return useCallback(
        ({ props, omit, transient }) => dispatch({ type: 'updateProps', ids, props, omit, transient }),
        [dispatch, ids],
    );
}

/**
 * Gets an ObjectUpdaterAction that is equivalent to setOrOmit(object, key, value)
 */
export function setOrOmitAction<T>(key: OptionalBooleanKeys<T>, value: boolean): ObjectUpdaterAction<T> {
    if (value) {
        return { props: { [key]: true } as Partial<T> };
    }
    return { omit: [key] };
}
