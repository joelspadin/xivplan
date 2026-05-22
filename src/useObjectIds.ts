import { useState } from 'react';
import type { BaseObject } from './scene';

export function getObjectIds(objects: readonly BaseObject[]): number[] {
    return objects.map((obj) => obj.id);
}

export function objectIdsAreEqual(objects: readonly BaseObject[], ids: readonly number[]): boolean {
    return objects.length === ids.length && objects.every((obj, i) => obj.id === ids[i]);
}

/**
 * Returns a list of the objects' IDs. This is a stable array which only changes when the list of objects changes,
 * ignoring other properties on the objects.
 */
export function useObjectIds(objects: readonly BaseObject[]): number[] {
    const [ids, setIds] = useState(() => getObjectIds(objects));

    if (objectIdsAreEqual(objects, ids)) {
        return ids;
    }

    const newIds = getObjectIds(objects);
    setIds(newIds);
    return newIds;
}
