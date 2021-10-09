import { KonvaEventObject } from 'konva/lib/Node';
import React, { useCallback } from 'react';
import { Group } from 'react-konva';
import { addSelection, selectSingle, toggleSelection, useSelection } from '../SelectionProvider';

export interface SelectableObjectProps {
    index: number;
}

export const SelectableObject: React.FC<SelectableObjectProps> = ({ index, children }) => {
    const [selection, setSelection] = useSelection();

    const onClick = useCallback(
        (e: KonvaEventObject<MouseEvent>) => {
            if (e.evt.shiftKey) {
                setSelection(addSelection(selection, index));
            } else if (e.evt.ctrlKey) {
                setSelection(toggleSelection(selection, index));
            } else {
                setSelection(selectSingle(index));
            }

            e.cancelBubble = true;
        },
        [index, selection, setSelection],
    );

    return <Group onClick={onClick}>{children}</Group>;
};
