import { createContext, Dispatch, SetStateAction } from 'react';

/**
 * Set of object IDs for selected objects.
 */
export type SceneSelection = ReadonlySet<number>;

export type SelectionState = [SceneSelection, Dispatch<SetStateAction<SceneSelection>>];

export const SelectionContext = createContext<SelectionState>([new Set(), () => undefined]);

export const SpotlightContext = createContext<SelectionState>([new Set(), () => undefined]);
