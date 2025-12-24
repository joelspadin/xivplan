import { KonvaEventObject } from 'konva/lib/Node';
import React, { PropsWithChildren } from 'react';
import { Group } from 'react-konva';
import { useAllowedParentIds, useUpdateParentIdsAction } from '../connections';
import { EditMode } from '../editMode';
import { isMoveable, SceneObject } from '../scene';
import { useScene } from '../SceneProvider';
import { addSelection, selectSingle, toggleSelection, useSelection } from '../selection';
import { useEditMode } from '../useEditMode';

export interface SelectableObjectProps extends PropsWithChildren {
    object: SceneObject;
}

export const SelectableObject: React.FC<SelectableObjectProps> = ({ object, children }) => {
    const [selection, setSelection] = useSelection();
    const [editMode, setEditMode] = useEditMode();
    const { dispatch } = useScene();
    const allowedParentIds = new Set(useAllowedParentIds());
    const getUpdateParentIdsAction = useUpdateParentIdsAction();
    const isSelectable = editMode === EditMode.Normal || editMode === EditMode.SelectConnection;

    const onClick = (e: KonvaEventObject<MouseEvent>) => {
        if (editMode == EditMode.SelectConnection) {
            if (isMoveable(object) && allowedParentIds.has(object.id)) {
                dispatch(getUpdateParentIdsAction(object));
                setEditMode(EditMode.Normal);
            }
            // If an object is clicked that is not a valid parent while in this mode, do nothing.
        } else if (e.evt.shiftKey) {
            setSelection(addSelection(selection, object.id));
        } else if (e.evt.ctrlKey) {
            setSelection(toggleSelection(selection, object.id));
        } else {
            setSelection(selectSingle(object.id));
        }

        e.cancelBubble = true;
    };

    return <Group onClick={isSelectable ? onClick : undefined}>{children}</Group>;
};
