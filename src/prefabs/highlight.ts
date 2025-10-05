import { ShapeConfig } from 'konva/lib/Shape';
import { EditMode } from '../editMode';
import { isMoveable, UnknownObject } from '../scene';
import { useSelection, useSpotlight } from '../selection';
import { SceneSelection } from '../SelectionContext';
import { SELECTED_PROPS, SPOTLIGHT_PROPS } from '../theme';
import { useEditMode } from '../useEditMode';

function shouldShowResizer(object: UnknownObject, selection: SceneSelection, editMode: EditMode) {
    return (
        selection.size === 1 &&
        selection.has(object.id) &&
        editMode === EditMode.Normal &&
        isMoveable(object) &&
        !object.pinned
    );
}

export function useHighlightProps(object: UnknownObject): ShapeConfig | undefined {
    const [editMode] = useEditMode();
    const [selection] = useSelection();
    const [spotlight] = useSpotlight();

    // Regular selection styling takes precedence if it's the only selected object.
    if (spotlight.has(object.id) && !(selection.size === 1 && selection.has(object.id))) {
        return SPOTLIGHT_PROPS;
    }

    return selection.has(object.id) && !shouldShowResizer(object, selection, editMode) ? SELECTED_PROPS : undefined;
}

export function useShowResizer(object: UnknownObject): boolean {
    const [editMode] = useEditMode();
    const [selection] = useSelection();
    return shouldShowResizer(object, selection, editMode);
}
