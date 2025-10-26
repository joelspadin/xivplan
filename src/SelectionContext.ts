import { createContext, Dispatch, SetStateAction } from 'react';

/**
 * Set of object IDs for selected objects.
 */
export type SceneSelection = ReadonlySet<number>;

export type SelectionState = [SceneSelection, Dispatch<SetStateAction<SceneSelection>>];

/**
 * Set of objects that are selected.
 */
export const SelectionContext = createContext<SelectionState>([new Set(), () => undefined]);

/**
 * Set of objects that are highlighted (e.g. when the user hovers over an object
 * in the scene list, to show that object in the scene).
 */
export const SpotlightContext = createContext<SelectionState>([new Set(), () => undefined]);

/**
 * Set of objects that are currently being dragged.
 *
 * When not dragging, the set should be empty. When starting a drag, the drag
 * selection should be set to match the moveable objects in the regular selection
 * using getNewDragSelection(). This ensures that changing the selection in the
 * middle of a drag doesn't break anything.
 */
export const DragSelectionContext = createContext<SelectionState>([new Set(), () => undefined]);
