import React, { useCallback } from 'react';
import { Group } from 'react-konva';
import { useSelection } from '../SelectionProvider';

export interface SelectableObjectProps {
    index: number;
}

export const SelectableObject: React.FC<SelectableObjectProps> = ({ index, children }) => {
    const [, setSelection] = useSelection();

    const onClick = useCallback(() => {
        setSelection([index]);
    }, [index, setSelection]);

    return <Group onMouseDown={onClick}>{children}</Group>;
};
