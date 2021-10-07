import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { SceneObject } from './scene';
import { useScene } from './SceneProvider';

export type SceneSelection = readonly number[];

export type SelectionState = [SceneSelection, Dispatch<SetStateAction<SceneSelection>>];

export const SelectionContext = createContext<SelectionState>([[], () => undefined]);

export const SelectionProvider: React.FC = ({ children }) => {
    const state = useState<SceneSelection>([]);

    return <SelectionContext.Provider value={state}>{children}</SelectionContext.Provider>;
};

export function useSelection(): SelectionState {
    return useContext(SelectionContext);
}

export interface SelectedObjects {
    objects: readonly SceneObject[];
}

export function useSelectedObjects(): readonly SceneObject[] {
    const [scene] = useScene();
    const [selection] = useSelection();

    return scene.objects.filter((_, i) => selection.includes(i));
}
