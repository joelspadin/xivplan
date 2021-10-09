import { Vector2d } from 'konva/lib/types';
import React, { ReactNode, useState } from 'react';
import { Group } from 'react-konva';
import { getCanvasCoord, getSceneCoord } from '../render/coord';
import { MoveableObject, UnknownObject } from '../scene';
import { useScene } from '../SceneProvider';
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
    const center = getCanvasCoord(scene, object);

    return (
        <SelectableObject index={index}>
            <Group
                {...center}
                draggable
                onDragStart={(e) => {
                    setDragging(true);
                    onActive?.(true);
                    setDragCenter(e.target.position());
                }}
                onDragMove={(e) => {
                    setDragCenter(e.target.position());
                }}
                onDragEnd={(e) => {
                    setDragging(false);
                    onActive?.(false);

                    const pos = getSceneCoord(scene, e.target.position());
                    dispatch({ type: 'update', index, value: { ...object, ...pos } });
                }}
            >
                {typeof children === 'function' ? children?.(dragging ? dragCenter : center) : children}
            </Group>
        </SelectableObject>
    );
};
