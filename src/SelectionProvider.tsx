import React, { createContext, Dispatch, PropsWithChildren, SetStateAction, useState } from 'react';

/**
 * Set of object IDs for selected objects.
 */
export type SceneSelection = ReadonlySet<number>;

export type SelectionState = [SceneSelection, Dispatch<SetStateAction<SceneSelection>>];

export const SelectionContext = createContext<SelectionState>([new Set(), () => undefined]);

export const SelectionProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const state = useState<SceneSelection>(new Set());

    return <SelectionContext.Provider value={state}>{children}</SelectionContext.Provider>;
};
