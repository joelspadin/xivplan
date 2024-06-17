import { mergeClasses } from '@fluentui/react-components';
import React, { useCallback } from 'react';
import { useScene } from '../SceneProvider';
import { useControlStyles } from '../useControlStyles';
import { ObjectList } from './ObjectList';

export const SceneObjectsPanel: React.FC = () => {
    const classes = useControlStyles();
    const { dispatch, step } = useScene();

    const moveObject = useCallback(
        (from: number, to: number) => {
            dispatch({ type: 'move', from, to });
        },
        [dispatch],
    );

    return (
        <div className={mergeClasses(classes.panel, classes.noSelect)}>
            <ObjectList objects={step.objects} onMove={moveObject} />
        </div>
    );
};
