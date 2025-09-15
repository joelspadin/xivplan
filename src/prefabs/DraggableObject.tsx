import { KonvaEventObject } from 'konva/lib/Node';
import React, { ReactNode } from 'react';
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
    const { scene, dispatch } = useScene();
    const [selection, setSelection] = useSelection();
    const center = getCanvasCoord(scene, object);

    const isDraggable = !object.pinned && editMode === EditMode.Normal;

    const onDragStart = (e: KonvaEventObject<DragEvent>) => {
        onActive?.(true);

        // If we start dragging an object that isn't selected, it should
        // become the new selection.
        if (!selection.has(object.id)) {
            setSelection(selectSingle(object.id));
        }

        // Ensure the start position is pushed onto the history stack, as further drag
        // events will only update the present.
        const pos = getSceneCoord(scene, e.target.position());
        dispatch({ type: 'update', value: { ...object, ...pos } });
    };

    const onDragMove = (e: KonvaEventObject<DragEvent>) => {
        const pos = getSceneCoord(scene, e.target.position());
        dispatch({ type: 'update', value: { ...object, ...pos }, skipHistoryUpdate: true });
    };

    const onDragEnd = (e: KonvaEventObject<DragEvent>) => {
        onActive?.(false);

        onDragMove(e);
    };

    return (
        <DraggableCenterContext value={center}>
            <SelectableObject object={object}>
                <TetherTarget object={object}>
                    <CursorGroup
                        {...center}
                        cursor={isDraggable ? 'move' : undefined}
                        draggable={isDraggable}
                        onDragStart={onDragStart}
                        onDragMove={onDragMove}
                        onDragEnd={onDragEnd}
                    >
                        {children}
                    </CursorGroup>
                </TetherTarget>
            </SelectableObject>
        </DraggableCenterContext>
    );
};
