import { Dispatch, useContext } from 'react';
import { DirtyContext, SavedStateContext } from './DirtyContext';
import { Scene } from './scene';

/**
 * @returns whether the scene has changed since the last save.
 */

export function useIsDirty(): boolean {
    return useContext(DirtyContext);
}
/**
 * @returns a function which sets the scene against which useIsDirty() compares.
 */

export function useSetSavedState(): Dispatch<Scene> {
    return useContext(SavedStateContext);
}
