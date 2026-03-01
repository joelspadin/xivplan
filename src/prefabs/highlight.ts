import { ShapeConfig } from 'konva/lib/Shape';
import { getPositionParentId, useIsAllowedConnectionTarget } from '../connections';
import { EditMode } from '../editMode';
import { isMoveable, UnknownObject } from '../scene';
import { getObjectById, useScene } from '../SceneProvider';
import { useSelection, useSpotlight } from '../selection';
import { SceneSelection } from '../SelectionContext';
import { SELECTED_CONNECTED_PROPS, SELECTED_PROPS, SPOTLIGHT_CONNECTED_PROPS, SPOTLIGHT_PROPS } from '../theme';
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
    const scene = useScene().scene;

    // Regular selection styling takes precedence if it's the only selected object.
    if (spotlight.has(object.id) && !(selection.size === 1 && selection.has(object.id))) {
        return SPOTLIGHT_PROPS;
    }

    if (selection.has(object.id) && !shouldShowResizer(object, selection, editMode)) {
        return SELECTED_PROPS;
    }

    // If one of the objects this is connected to is in the spotlight or selection
    let positionParentId = getPositionParentId(object);
    while (positionParentId !== undefined) {
        if (spotlight.has(positionParentId)) {
            // This is slightly weird when the parent object has a resizer thing.
            // maybe the resizer should follow the spotlight coloring?
            return SPOTLIGHT_CONNECTED_PROPS;
        }
        if (selection.has(positionParentId)) {
            return SELECTED_CONNECTED_PROPS;
        }
        const parentObject = getObjectById(scene, positionParentId);
        positionParentId = getPositionParentId(parentObject);
    }

    return undefined;
}

export function useOverrideProps(object: UnknownObject): ShapeConfig | undefined {
    const [editMode] = useEditMode();
    const [selection] = useSelection();
    const isAllowedConnectionTarget = useIsAllowedConnectionTarget(object.id);
    if (editMode == EditMode.SelectConnection && !isAllowedConnectionTarget && !selection.has(object.id)) {
        return { opacity: 0.1 };
    }
    return undefined;
}

export function useShowResizer(object: UnknownObject): boolean {
    const [editMode] = useEditMode();
    const [selection] = useSelection();
    return shouldShowResizer(object, selection, editMode);
}
