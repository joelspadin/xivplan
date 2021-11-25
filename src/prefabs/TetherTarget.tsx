import { KonvaEventObject } from 'konva/lib/Node';
import React, { useCallback } from 'react';
import { CursorGroup } from '../cursor';
import { EditMode, TetherConfig, useEditMode, useTetherConfig } from '../EditModeProvider';
import { isMoveable, MoveableObject, Tether, UnknownObject } from '../scene';
import { useScene } from '../SceneProvider';
import { getSelectedObjects, selectNone, selectSingle, useSelection } from '../SelectionProvider';
import { makeTether } from './Tethers';

export interface TetherTargetProps {
    object: MoveableObject & UnknownObject;
}

function getTether(ids: readonly number[], config: TetherConfig): Omit<Tether, 'id'> | undefined {
    if (ids.length > 2) {
        return undefined;
    }

    const [start, end] = ids;

    if (start === undefined || end === undefined) {
        return undefined;
    }

    return makeTether(start, end, config.tether);
}

export const TetherTarget: React.FC<TetherTargetProps> = ({ object, children }) => {
    const [selection, setSelection] = useSelection();
    const [editMode] = useEditMode();
    const [tetherConfig] = useTetherConfig();
    const [scene, dispatch] = useScene();

    const isSelectable = editMode === EditMode.Tether;

    const onClick = useCallback(
        (e: KonvaEventObject<MouseEvent>) => {
            const targetIds = getSelectedObjects(scene, selection)
                .filter(isMoveable)
                .map((x) => x.id);

            const tether = getTether([...targetIds, object.id], tetherConfig);

            if (tether) {
                dispatch({ type: 'add', object: tether });
                setSelection(e.evt.ctrlKey ? selectSingle(object.id) : selectNone());
            } else {
                setSelection(selectSingle(object.id));
            }

            e.cancelBubble = true;
        },
        [object.id, selection, setSelection, scene, dispatch, tetherConfig],
    );

    return (
        <CursorGroup cursor={isSelectable ? 'cell' : undefined} onClick={isSelectable ? onClick : undefined}>
            {children}
        </CursorGroup>
    );
};
