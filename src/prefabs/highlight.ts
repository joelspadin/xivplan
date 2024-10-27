import { EditMode } from '../editMode';
import { isMoveable, UnknownObject } from '../scene';
import { useSelection } from '../selection';
import { SceneSelection } from '../SelectionContext';
import { useEditMode } from '../useEditMode';

function isPinned(object: UnknownObject) {
    if (isMoveable(object)) {
        return object.pinned ?? false;
    }
    return false;
}

function isResizeable(object: UnknownObject, selection: SceneSelection, editMode: EditMode) {
    return selection.size === 1 && editMode === EditMode.Normal && !isPinned(object);
}

export function useShowHighlight(object: UnknownObject): boolean {
    const [editMode] = useEditMode();
    const [selection] = useSelection();
    return selection.has(object.id) && !isResizeable(object, selection, editMode);
}

export function useShowResizer(object: UnknownObject): boolean {
    const [editMode] = useEditMode();
    const [selection] = useSelection();
    return selection.has(object.id) && isResizeable(object, selection, editMode);
}
