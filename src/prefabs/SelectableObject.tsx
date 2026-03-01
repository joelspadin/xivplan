import { KonvaEventObject } from 'konva/lib/Node';
import React, { PropsWithChildren } from 'react';
import { Group } from 'react-konva';
import { useIsAllowedConnectionTarget, useUpdateConnectedIdsAction } from '../connections';
import { EditMode } from '../editMode';
import { isMoveable, SceneObject } from '../scene';
import { useScene } from '../SceneProvider';
import {
    addSelection,
    removeSelection,
    selectNone,
    selectSingle,
    toggleSelection,
    useSelection,
    useSpotlight,
} from '../selection';
import { useEditMode } from '../useEditMode';

export interface SelectableObjectProps extends PropsWithChildren {
    object: SceneObject;
}

export const SelectableObject: React.FC<SelectableObjectProps> = ({ object, children }) => {
    const [selection, setSelection] = useSelection();
    const [spotlight, setSpotlight] = useSpotlight();
    const [editMode, setEditMode] = useEditMode();
    const { dispatch } = useScene();
    const isAllowedConnectionTarget = useIsAllowedConnectionTarget(object.id);
    const getUpdateConnectionIdsAction = useUpdateConnectedIdsAction();
    const isSelectable = editMode === EditMode.Normal || editMode === EditMode.SelectConnection;

    const onClick = (e: KonvaEventObject<MouseEvent>) => {
        if (editMode == EditMode.SelectConnection) {
            if (isMoveable(object) && isAllowedConnectionTarget) {
                dispatch(getUpdateConnectionIdsAction(object));
                setEditMode(EditMode.Normal);
            }
            // If an object is clicked that is not a valid connection while in this mode, do nothing.
        } else if (e.evt.shiftKey) {
            setSelection(addSelection(selection, object.id));
        } else if (e.evt.ctrlKey) {
            setSelection(toggleSelection(selection, object.id));
        } else {
            setSelection(selectSingle(object.id));
        }

        e.cancelBubble = true;
    };

    const onMouseEnter = () => {
        if (editMode == EditMode.SelectConnection) {
            if (isAllowedConnectionTarget) {
                setSpotlight(selectSingle(object.id));
            } else {
                setSpotlight(selectNone());
            }
        }
    };
    const onMouseLeave = () => {
        // don't selectNone() to avoid overriding another object's onMouseEnter
        setSpotlight(removeSelection(spotlight, object.id));
    };

    return (
        <Group onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={isSelectable ? onClick : undefined}>
            {children}
        </Group>
    );
};
