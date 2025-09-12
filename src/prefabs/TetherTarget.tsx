import { KonvaEventObject } from 'konva/lib/Node';
import React, { PropsWithChildren } from 'react';
import { CursorGroup } from '../CursorGroup';
import { TetherConfig } from '../EditModeContext';
import { useScene } from '../SceneProvider';
import { EditMode } from '../editMode';
import { MoveableObject, Tether, UnknownObject, isMoveable } from '../scene';
import { getSelectedObjects, selectNone, selectSingle, useSelection } from '../selection';
import { useEditMode } from '../useEditMode';
import { useTetherConfig } from '../useTetherConfig';
import { makeTether } from './TetherConfig';

export interface TetherTargetProps extends PropsWithChildren {
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
    const { dispatch, step } = useScene();

    const isSelectable = editMode === EditMode.Tether;

    const onClick = (e: KonvaEventObject<MouseEvent>) => {
        const targetIds = getSelectedObjects(step, selection)
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
    };

    return (
        <CursorGroup cursor={isSelectable ? 'cell' : undefined} onClick={isSelectable ? onClick : undefined}>
            {children}
        </CursorGroup>
    );
};
