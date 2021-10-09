import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import React, { ReactNode, useCallback, useState } from 'react';
import { Group } from 'react-konva';
import { getCanvasCoord, getSceneCoord } from '../render/coord';
import { MoveableObject, UnknownObject } from '../scene';
import { useScene } from '../SceneProvider';
import { selectSingle, useSelection } from '../SelectionProvider';
import { SelectableObject } from './SelectableObject';

export interface DraggableObjectProps {
    object: MoveableObject & UnknownObject;
    index: number;
    onActive?: React.Dispatch<boolean>;
    children?: ReactNode | ((center: Vector2d) => React.ReactElement);
}

export const DraggableObject: React.VFC<DraggableObjectProps> = ({ object, index, onActive, children }) => {
    const [dragCenter, setDragCenter] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [scene, dispatch] = useScene();
    const [selection, setSelection] = useSelection();
    const center = getCanvasCoord(scene, object);

    const onDragStart = useCallback(
        (e: KonvaEventObject<DragEvent>) => {
            setDragging(true);
            onActive?.(true);
            setDragCenter(e.target.position());

            // If we start dragging an object that isn't selected, it should
            // become the new selection.
            if (!selection.has(index)) {
                setSelection(selectSingle(index));
            }
        },
        [setDragging, onActive, setDragCenter, index, selection, setSelection],
    );

    const onDragEnd = useCallback(
        (e: KonvaEventObject<DragEvent>) => {
            setDragging(false);
            onActive?.(false);

            const pos = getSceneCoord(scene, e.target.position());
            dispatch({ type: 'update', index, value: { ...object, ...pos } });
        },
        [setDragging, onActive, dispatch],
    );

    return (
        <SelectableObject index={index}>
            <Group
                {...center}
                draggable={!object.pinned}
                onDragStart={onDragStart}
                onDragMove={(e) => setDragCenter(e.target.position())}
                onDragEnd={onDragEnd}
            >
                {typeof children === 'function' ? children?.(dragging ? dragCenter : center) : children}
            </Group>
        </SelectableObject>
    );
};
