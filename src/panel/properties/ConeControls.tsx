import { IStyle, Position, mergeStyleSets } from '@fluentui/react';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { MAX_CONE_ANGLE, MIN_CONE_ANGLE } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { ArcZone, ConeZone } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const classNames = mergeStyleSets({
    padded: {
        marginRight: 32 + 10,
    } as IStyle,
});

export const ConeAngleControl: React.FC<PropertiesControlProps<ArcZone | ConeZone>> = ({ objects }) => {
    const { dispatch } = useScene();

    const coneAngle = useMemo(() => commonValue(objects, (obj) => obj.coneAngle), [objects]);

    const onAngleChanged = useSpinChanged((coneAngle: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, coneAngle })) }),
    );

    return (
        <SpinButtonUnits
            className={classNames.padded}
            label="Angle"
            labelPosition={Position.top}
            value={coneAngle?.toString() ?? ''}
            onChange={onAngleChanged}
            min={MIN_CONE_ANGLE}
            max={MAX_CONE_ANGLE}
            step={5}
            suffix="°"
        />
    );
};
