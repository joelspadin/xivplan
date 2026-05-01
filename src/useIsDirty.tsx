import { type Dispatch, use } from 'react';
import { DirtyContext, SavedStateContext } from './DirtyContext';
import type { Scene } from './scene';

/**
 * @returns whether the scene has changed since the last save.
 */

export function useIsDirty(): boolean {
    return use(DirtyContext);
}
/**
 * @returns a function which sets the scene against which useIsDirty() compares.
 */

export function useSetSavedState(): Dispatch<Scene> {
    return use(SavedStateContext);
}
