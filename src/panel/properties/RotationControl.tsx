import { Position } from '@fluentui/react';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { EnemyObject, RotateableObject, isEnemy } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const RotationControl: React.FC<PropertiesControlProps<RotateableObject | EnemyObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const rotation = useMemo(() => commonValue(objects, (obj) => obj.rotation), [objects]);
    const omniDirection = useMemo(() => commonValue(objects, (obj) => isEnemy(obj) && obj.omniDirection), [objects]);

    const onRotationChanged = useSpinChanged((rotation: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, rotation })) }),
    );

    return (
        <SpinButtonUnits
            disabled={omniDirection}
            label="Rotation"
            labelPosition={Position.top}
            value={rotation?.toString() ?? ''}
            onChange={onRotationChanged}
            step={15}
            suffix="°"
        />
    );
};
