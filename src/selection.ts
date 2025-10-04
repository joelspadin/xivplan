import { useContext } from 'react';
import { SceneSelection, SelectionContext, SelectionState, SpotlightContext } from './SelectionContext';
import { Scene, SceneObject, SceneStep } from './scene';

export function useSelection(): SelectionState {
    return useContext(SelectionContext);
}

export function useSpotlight(): SelectionState {
    return useContext(SpotlightContext);
}

export function getSelectedObjects(step: SceneStep, selection: SceneSelection): readonly SceneObject[] {
    return step.objects.filter((object) => selection.has(object.id));
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
