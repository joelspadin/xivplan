import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { Scene, SceneObject } from './scene';
import { useScene } from './SceneProvider';

export type SceneSelection = ReadonlySet<number>;

export type SelectionState = [SceneSelection, Dispatch<SetStateAction<SceneSelection>>];

export const SelectionContext = createContext<SelectionState>([new Set(), () => undefined]);

export const SelectionProvider: React.FC = ({ children }) => {
    const state = useState<SceneSelection>(new Set());

    return <SelectionContext.Provider value={state}>{children}</SelectionContext.Provider>;
};

export function useSelection(): SelectionState {
    return useContext(SelectionContext);
}

export interface SelectedObjects {
    objects: readonly SceneObject[];
}

export function getSelectedObjects(scene: Scene, selection: SceneSelection): readonly SceneObject[] {
    return scene.objects.filter((_, i) => selection.has(i));
}

export function useSelectedObjects(): readonly SceneObject[] {
    const [scene] = useScene();
    const [selection] = useSelection();

    return getSelectedObjects(scene, selection);
}

export function useIsSelected(index: number): boolean {
    const [selection] = useSelection();
    return selection.has(index);
}

export function selectSingle(index: number): SceneSelection {
    return new Set([index]);
}

export function selectNone(): SceneSelection {
    return new Set();
}

export function selectAll(objects: readonly SceneObject[]): SceneSelection {
    return new Set(objects.map((_, i) => i));
}

export function addSelection(selection: SceneSelection, index: number): SceneSelection {
    return new Set(selection).add(index);
}

export function removeSelection(selection: SceneSelection, index: number): SceneSelection {
    const newSelection = new Set(selection);
    newSelection.delete(index);
    return newSelection;
}

export function toggleSelection(selection: SceneSelection, index: number): SceneSelection {
    if (selection.has(index)) {
        return removeSelection(selection, index);
    } else {
        return addSelection(selection, index);
    }
}
