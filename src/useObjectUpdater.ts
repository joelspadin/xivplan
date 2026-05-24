import { useCallback } from 'react';
import type { SceneObject } from './scene';
import { useScene } from './SceneProvider';
import { useObjectIds } from './useObjectIds';
import type { OptionalBooleanKeys, OptionalKeys } from './util';

export interface ObjectUpdaterAction<T> {
    /** Collection of props to set on each object */
    props?: Partial<T>;
    /** List of keys to delete from each object. */
    omit?: readonly OptionalKeys<T>[];
    /** Whether the `transient` bit should be set on the `transform` action. */
    transient?: boolean;
}

export type ObjectUpdater<T extends SceneObject> = (update: ObjectUpdaterAction<T>) => void;

/**
 * Returns a function which dispatches a 'transform' action for the given objects when called.
 *
 * This can be used as syntactic sugar instead of dispatching a 'transform' action manually
 * when all objects need to set or delete the same property value.
 */
export function useObjectUpdater<T extends SceneObject>(
    objects: readonly T[],
): (action: ObjectUpdaterAction<T>) => void {
    const { dispatch } = useScene();
    const ids = useObjectIds(objects);

    return useCallback(
        ({ props, omit, transient }) =>
            dispatch({ type: 'transform', ids, transformFn: (obj) => updateProps(obj, props, omit), transient }),
        [dispatch, ids],
    );
}

function updateProps<T extends SceneObject>(
    obj: SceneObject,
    props?: Partial<T>,
    omitProps?: readonly OptionalKeys<T>[],
): SceneObject {
    const newObject = { ...obj, ...props };

    if (omitProps) {
        for (const key of omitProps) {
            delete newObject[key as keyof SceneObject];
        }
    }

    return newObject;
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
