import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { Scene, SceneObject, SceneStep } from './scene';
import { useCurrentStep } from './SceneProvider';

/**
 * Set of object IDs for selected objects.
 */
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

export function getSelectedObjects(step: SceneStep, selection: SceneSelection): readonly SceneObject[] {
    return step.objects.filter((object) => selection.has(object.id));
}

export function useSelectedObjects(): readonly SceneObject[] {
    const step = useCurrentStep();
    const [selection] = useSelection();

    return getSelectedObjects(step, selection);
}

export function useIsSelected(object: SceneObject): boolean {
    const [selection] = useSelection();
    return selection.has(object.id);
}

export function selectSingle(id: number): SceneSelection {
    return new Set([id]);
}

export function selectNone(): SceneSelection {
    return new Set();
}

export function selectAll(objects: readonly SceneObject[]): SceneSelection {
    return new Set(objects.map((object) => object.id));
}

export function selectNewObjects(scene: Scene, newObjectCount: number): SceneSelection {
    return new Set(Array.from({ length: newObjectCount }).map((_, i) => scene.nextId + i));
}

export function addSelection(selection: SceneSelection, id: number): SceneSelection {
    return new Set(selection).add(id);
}

export function removeSelection(selection: SceneSelection, id: number): SceneSelection {
    const newSelection = new Set(selection);
    newSelection.delete(id);
    return newSelection;
}

export function toggleSelection(selection: SceneSelection, id: number): SceneSelection {
    if (selection.has(id)) {
        return removeSelection(selection, id);
    } else {
        return addSelection(selection, id);
    }
}
