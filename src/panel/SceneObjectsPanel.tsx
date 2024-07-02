import { mergeClasses } from '@fluentui/react-components';
import React, { useCallback } from 'react';
import { useScene } from '../SceneProvider';
import { useControlStyles } from '../useControlStyles';
import { ObjectList } from './ObjectList';

export interface SceneObjectsPanelProps {
    className?: string;
}

export const SceneObjectsPanel: React.FC<SceneObjectsPanelProps> = ({ className }) => {
    const classes = useControlStyles();
    const { dispatch, step } = useScene();

    const moveObject = useCallback(
        (from: number, to: number) => {
            dispatch({ type: 'move', from, to });
        },
        [dispatch],
    );

    return (
        <div className={mergeClasses(classes.panel, classes.noSelect, className)}>
            <ObjectList objects={step.objects} onMove={moveObject} />
        </div>
    );
};
