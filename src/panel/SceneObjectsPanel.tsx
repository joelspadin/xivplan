import { IStyle, mergeStyleSets } from '@fluentui/react';
import React, { useCallback } from 'react';
import { useScene } from '../SceneProvider';
import { ObjectList } from './ObjectList';
import { PANEL_PADDING } from './PanelStyles';

const classNames = mergeStyleSets({
    root: {
        padding: PANEL_PADDING,
        userSelect: 'none',
    } as IStyle,
});

export const SceneObjectsPanel: React.FC = () => {
    const { dispatch, step } = useScene();

    const moveObject = useCallback(
        (from: number, to: number) => {
            dispatch({ type: 'move', from, to });
        },
        [dispatch],
    );

    return (
        <div className={classNames.root}>
            <ObjectList objects={step.objects} onMove={moveObject} />
        </div>
    );
};
