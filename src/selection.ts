import { use } from 'react';
import {
    DragSelectionContext,
    SceneSelection,
    SelectionContext,
    SelectionState,
    SpotlightContext,
} from './SelectionContext';
import { isMoveable, Scene, SceneObject, SceneStep } from './scene';

/**
 * State for selected objects.
 */
export function useSelection(): SelectionState {
    return use(SelectionContext);
}

/**
 * State for objects that should be highlighted in the scene.
 */
export function useSpotlight(): SelectionState {
    return use(SpotlightContext);
}

/**
 * State for objects currently being dragged.
 */
export function useDragSelection(): SelectionState {
    return use(DragSelectionContext);
}

/**
 * Gets whether the given object is in the drag selection.
 */
export function useIsDragging(object: SceneObject) {
    return useDragSelection()[0].has(object.id);
}

/**
 * Gets the objects in the given step whose IDs are in the given selection.
 */
export function getSelectedObjects(step: SceneStep, selection: SceneSelection): readonly SceneObject[] {
    return step.objects.filter((object) => selection.has(object.id));
}

/**
 * Gets the objects in the given step and selection which should be set as the
 * drag selection when starting a drag operation.
 */
export function getNewDragSelection(step: SceneStep, selection: SceneSelection): SceneSelection {
    return new Set(
        getSelectedObjects(step, selection)
            .filter(isMoveable)
            .map((obj) => obj.id),
    );
}

/**
 * Gets a new selection with only the given ID.
 */
export function selectSingle(id: number): SceneSelection {
    return new Set([id]);
}

/**
 * Gets a new, empty selection.
 */
export function selectNone(): SceneSelection {
    return new Set();
}

/**
 * Gets a new selection which contains all of the given objects.
 */
export function selectAll(objects: readonly SceneObject[]): SceneSelection {
    return new Set(objects.map((object) => object.id));
}

/**
 * Gets a new selection which contains a given number of objects which have yet
 * to be created. Use this when creating new objects in order to make them be
 * selected after they are created.
 */
export function selectNewObjects(scene: Scene, newObjectCount: number): SceneSelection {
    return new Set(Array.from({ length: newObjectCount }).map((_, i) => scene.nextId + i));
}

/**
 * Gets a new selection from the given selection with a new ID added.
 */
export function addSelection(selection: SceneSelection, id: number): SceneSelection {
    return new Set(selection).add(id);
}

/**
 * Gets a new selection from the given selection with an ID removed if it was
 * in the selection.
 */
export function removeSelection(selection: SceneSelection, id: number): SceneSelection {
    const newSelection = new Set(selection);
    newSelection.delete(id);
    return newSelection;
}

/**
 * Gets a new selection from the given selection with an ID added if it was not
 * in the selection or removed if it was.
 */
export function toggleSelection(selection: SceneSelection, id: number): SceneSelection {
    if (selection.has(id)) {
        return removeSelection(selection, id);
    } else {
        return addSelection(selection, id);
    }
}
