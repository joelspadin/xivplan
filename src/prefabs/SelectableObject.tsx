import { KonvaEventObject } from 'konva/lib/Node';
import React, { PropsWithChildren } from 'react';
import { Group } from 'react-konva';
import { EditMode } from '../editMode';
import { SceneObject } from '../scene';
import { addSelection, selectSingle, toggleSelection, useSelection } from '../selection';
import { useEditMode } from '../useEditMode';

export interface SelectableObjectProps extends PropsWithChildren {
    object: SceneObject;
}

export const SelectableObject: React.FC<SelectableObjectProps> = ({ object, children }) => {
    const [selection, setSelection] = useSelection();
    const [editMode] = useEditMode();
    const isSelectable = editMode === EditMode.Normal;

    const onClick = (e: KonvaEventObject<MouseEvent>) => {
        if (e.evt.shiftKey) {
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
