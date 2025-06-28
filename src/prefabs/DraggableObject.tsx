import { KonvaEventObject } from 'konva/lib/Node';
import React, { ReactNode, useCallback, useState } from 'react';
import { CursorGroup } from '../CursorGroup';
import { useScene } from '../SceneProvider';
import { getCanvasCoord, getSceneCoord } from '../coord';
import { EditMode } from '../editMode';
import { MoveableObject, UnknownObject } from '../scene';
import { selectSingle, useSelection } from '../selection';
import { useEditMode } from '../useEditMode';
import { DraggableCenterContext } from './DraggableCenterContext';
import { SelectableObject } from './SelectableObject';
import { TetherTarget } from './TetherTarget';

export interface DraggableObjectProps {
    object: MoveableObject & UnknownObject;
    onActive?: React.Dispatch<boolean>;
    children?: ReactNode;
}

export const DraggableObject: React.FC<DraggableObjectProps> = ({ object, onActive, children }) => {
    const [editMode] = useEditMode();
    const [dragCenter, setDragCenter] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const { scene, dispatch } = useScene();
    const [selection, setSelection] = useSelection();
    const center = getCanvasCoord(scene, object);

    const isDraggable = !object.pinned && editMode === EditMode.Normal;

    const onDragStart = useCallback(
        (e: KonvaEventObject<DragEvent>) => {
            setDragging(true);
            onActive?.(true);
            setDragCenter(e.target.position());

            // If we start dragging an object that isn't selected, it should
            // become the new selection.
            if (!selection.has(object.id)) {
                setSelection(selectSingle(object.id));
            }
        },
        [setDragging, onActive, setDragCenter, object.id, selection, setSelection],
    );

    const onDragEnd = useCallback(
        (e: KonvaEventObject<DragEvent>) => {
            setDragging(false);
            onActive?.(false);

            const pos = getSceneCoord(scene, e.target.position());
            dispatch({ type: 'update', value: { ...object, ...pos } });
        },
        [scene, setDragging, onActive, dispatch, object],
    );

    return (
        <DraggableCenterContext.Provider value={dragging ? dragCenter : center}>
            <SelectableObject object={object}>
                <TetherTarget object={object}>
                    <CursorGroup
                        {...center}
                        cursor={isDraggable ? 'move' : undefined}
                        draggable={isDraggable}
                        onDragStart={onDragStart}
                        onDragMove={(e) => setDragCenter(e.target.position())}
                        onDragEnd={onDragEnd}
                    >
                        {children}
                    </CursorGroup>
                </TetherTarget>
            </SelectableObject>
        </DraggableCenterContext.Provider>
    );
};
