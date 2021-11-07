import { KonvaEventObject } from 'konva/lib/Node';
import React, { useCallback } from 'react';
import { Group } from 'react-konva';
import { SceneObject } from '../scene';
import { addSelection, selectSingle, toggleSelection, useSelection } from '../SelectionProvider';

export interface SelectableObjectProps {
    object: SceneObject;
}

export const SelectableObject: React.FC<SelectableObjectProps> = ({ object, children }) => {
    const [selection, setSelection] = useSelection();

    const onClick = useCallback(
        (e: KonvaEventObject<MouseEvent>) => {
            if (e.evt.shiftKey) {
                setSelection(addSelection(selection, object.id));
            } else if (e.evt.ctrlKey) {
                setSelection(toggleSelection(selection, object.id));
            } else {
                setSelection(selectSingle(object.id));
            }

            e.cancelBubble = true;
        },
        [object.id, selection, setSelection],
    );

    return <Group onClick={onClick}>{children}</Group>;
};
