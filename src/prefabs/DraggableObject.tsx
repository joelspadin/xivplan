import { KonvaEventObject } from 'konva/lib/Node';
import React, { Dispatch, ReactNode } from 'react';
import { getCanvasCoord, getSceneCoord } from '../coord';
import { CursorGroup } from '../CursorGroup';
import { EditMode } from '../editMode';
import { moveObjectsBy } from '../groupOperations';
import { MoveableObject, Scene, SceneStep, UnknownObject } from '../scene';
import { SceneAction, useScene } from '../SceneProvider';
import {
    getNewDragSelection,
    getSelectedObjects,
    selectNone,
    selectSingle,
    useDragSelection,
    useSelection,
} from '../selection';
import { SceneSelection } from '../SelectionContext';
import { useEditMode } from '../useEditMode';
import { vecSub } from '../vector';
import { SelectableObject } from './SelectableObject';
import { TetherTarget } from './TetherTarget';

export interface DraggableObjectProps {
    object: MoveableObject & UnknownObject;
    children?: ReactNode;
}

export const DraggableObject: React.FC<DraggableObjectProps> = ({ object, children }) => {
    const [editMode] = useEditMode();
    const { scene, step, dispatch } = useScene();
    const [selection, setSelection] = useSelection();
    const [dragSelection, setDragSelection] = useDragSelection();
    const center = getCanvasCoord(scene, object);

    const isDraggable = !object.pinned && editMode === EditMode.Normal;

    const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
        let newSelection: SceneSelection;

        // If we start dragging an object that isn't selected, it should
        // become the new selection.
        if (!selection.has(object.id)) {
            newSelection = selectSingle(object.id);
            setSelection(newSelection);
        } else {
            newSelection = getNewDragSelection(step, selection);
        }

        setDragSelection(newSelection);

        updatePosition(scene, step, object, dragSelection, e, dispatch);
    };

    const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
        updatePosition(scene, step, object, dragSelection, e, dispatch);
    };

    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        updatePosition(scene, step, object, dragSelection, e, dispatch);
        dispatch({ type: 'commit' });

        setDragSelection(selectNone());
    };

    // TODO: Konva moves the shape immediately before calling the dragMove event,
    // so the object being dragged is always one frame ahead of the rest of the
    // state. Is there any way to delay the render until the event is handled,
    // or do we need to implement our own drag logic to replace Konva's?
    return (
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
    );
};

function updatePosition(
    scene: Scene,
    step: SceneStep,
    targetObject: MoveableObject & UnknownObject,
    dragSelection: SceneSelection,
    e: KonvaEventObject<DragEvent>,
    dispatch: Dispatch<SceneAction>,
) {
    // Konva automatically moves the object to e.target.position() in canvas
    // coordinates. Subtracting the object's original position gives the offset
    // that needs to be applied to all objects being dragged.
    const pos = getSceneCoord(scene, e.target.position());
    const offset = vecSub(pos, targetObject);

    if (offset.x === 0 && offset.y === 0) {
        return;
    }

    const draggedObjects = getSelectedObjects(step, dragSelection);
    const value = moveObjectsBy(draggedObjects, offset);

    dispatch({ type: 'update', value, transient: true });
}
