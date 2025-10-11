import { Vector2d } from 'konva/lib/types';
import React, { useLayoutEffect, useState } from 'react';
import { Group } from 'react-konva';
import { useScene } from '../SceneProvider';
import { getPointerPosition } from '../coord';
import { useDefaultCursor } from '../cursor';
import { EditMode } from '../editMode';
import { TetherToCursor } from '../prefabs/Tethers';
import { isMoveable } from '../scene';
import { getSelectedObjects, useSelection } from '../selection';
import { useEditMode } from '../useEditMode';
import { useTetherConfig } from '../useTetherConfig';
import { useStage } from './stage';

export const TetherEditRenderer: React.FC = () => {
    const [editMode] = useEditMode();
    return editMode === EditMode.Tether ? <TetherEditLayer /> : null;
};

const TetherEditLayer: React.FC = () => {
    const [cursor, setCursor] = useState<Vector2d | null>(null);
    const [, setDefaultCursor] = useDefaultCursor();
    const [tetherConfig] = useTetherConfig();
    const [selection] = useSelection();
    const { scene, step } = useScene();
    const stage = useStage();

    // eslint-disable-next-line react-hooks/exhaustive-deps -- https://github.com/reactwg/react-compiler/discussions/18
    const onMouseMove = () => setCursor(getPointerPosition(scene, stage));

    useLayoutEffect(() => {
        if (stage) {
            setDefaultCursor('alias');
            stage.container().style.cursor = 'alias';

            window.addEventListener('mousemove', onMouseMove);

            return () => {
                setDefaultCursor('default');
                stage.container().style.cursor = 'default';

                window.removeEventListener('mousemove', onMouseMove);
            };
        }
    }, [stage, onMouseMove, setDefaultCursor]);

    if (selection.size > 1 || !cursor) {
        return null;
    }

    const objects = getSelectedObjects(step, selection);
    const [start] = objects;

    if (!start || !isMoveable(start)) {
        return null;
    }

    // TODO: end position should snap to object when cursor is over object.
    const tetherProps = { startObject: start, cursorPos: cursor, tether: tetherConfig.tether };

    return (
        <Group listening={false}>
            <TetherToCursor {...tetherProps} />
        </Group>
    );
};
