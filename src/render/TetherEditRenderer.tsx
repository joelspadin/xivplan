import { Vector2d } from 'konva/lib/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Group } from 'react-konva';
import { EditMode } from '../EditModeProvider';
import { useScene } from '../SceneProvider';
import { getPointerPosition } from '../coord';
import { useDefaultCursor } from '../cursor';
import { TetherToCursor, TetherToCursorProps } from '../prefabs/Tethers';
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

    const onMouseMove = useCallback(() => setCursor(getPointerPosition(scene, stage)), [scene, stage, setCursor]);

    useEffect(() => {
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

    const tetherProps = useMemo<TetherToCursorProps | undefined>(() => {
        if (selection.size > 1 || !cursor) {
            return undefined;
        }

        const objects = getSelectedObjects(step, selection);
        const [start] = objects;

        if (!start || !isMoveable(start)) {
            return undefined;
        }

        // TODO: end position should snap to object when cursor is over object.
        return { startObject: start, cursorPos: cursor, tether: tetherConfig.tether };
    }, [cursor, step, selection, tetherConfig.tether]);

    if (!tetherProps) {
        return null;
    }

    return (
        <Group listening={false}>
            <TetherToCursor {...tetherProps} />
        </Group>
    );
};
