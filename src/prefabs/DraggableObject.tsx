import { KonvaEventObject } from 'konva/lib/Node';
import React, { Dispatch, ReactNode } from 'react';
import { CursorGroup } from '../CursorGroup';
import { SceneAction, useScene, useSceneCommit } from '../SceneProvider';
import { getCanvasCoord, getSceneCoord } from '../coord';
import { EditMode } from '../editMode';
import { MoveableObject, Scene, UnknownObject } from '../scene';
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
    const commit = useSceneCommit();
    const [selection, setSelection] = useSelection();
    const center = getCanvasCoord(scene, object);

    const isDraggable = !object.pinned && editMode === EditMode.Normal;

    const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
        onActive?.(true);

        // If we start dragging an object that isn't selected, it should
        // become the new selection.
        if (!selection.has(object.id)) {
            setSelection(selectSingle(object.id));
        }

        updatePosition(scene, object, e, dispatch);
    };

    const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
        updatePosition(scene, object, e, dispatch);
    };

    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        onActive?.(false);

        updatePosition(scene, object, e, dispatch);
        commit();
    };

    return (
        <DraggableCenterContext value={center}>
            <SelectableObject object={object}>
                <TetherTarget object={object}>
                    <CursorGroup
                        {...center}
                        cursor={isDraggable ? 'move' : undefined}
                        draggable={isDraggable}
                        onDragStart={handleDragStart}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                    >
                        {children}
                    </CursorGroup>
                </TetherTarget>
            </SelectableObject>
        </DraggableCenterContext>
    );
};

function updatePosition(
    scene: Scene,
    object: MoveableObject & UnknownObject,
    e: KonvaEventObject<DragEvent>,
    dispatch: Dispatch<SceneAction>,
) {
    const pos = getSceneCoord(scene, e.target.position());
    dispatch({ type: 'update', value: { ...object, ...pos }, transient: true });
}
