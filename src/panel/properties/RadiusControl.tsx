import { IStyle, Position, SpinButton, mergeStyleSets } from '@fluentui/react';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { InnerRadiusObject, RadiusObject, isInnerRadiusObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const RadiusControl: React.FC<PropertiesControlProps<RadiusObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const radius = useMemo(() => commonValue(objects, (obj) => obj.radius), [objects]);
    const hasInnerRadius = useMemo(() => objects[0] && isInnerRadiusObject(objects[0]), [objects]);

    const onRadiusChanged = useSpinChanged((radius: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, radius })) }),
    );

    const label = hasInnerRadius ? 'Radius 1' : 'Radius';

    return (
        <SpinButton
            label={label}
            labelPosition={Position.top}
            value={radius?.toString() ?? ''}
            onChange={onRadiusChanged}
            min={10}
            step={5}
        />
    );
};

const classNames = mergeStyleSets({
    padded: {
        marginRight: 32 + 10,
    } as IStyle,
});

export const InnerRadiusControl: React.FC<PropertiesControlProps<InnerRadiusObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const innerRadius = useMemo(() => commonValue(objects, (obj) => obj.innerRadius), [objects]);

    const onInnerRadiusChanged = useSpinChanged((innerRadius: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, innerRadius })) }),
    );

    return (
        <SpinButton
            className={classNames.padded}
            label="Radius 2"
            labelPosition={Position.top}
            value={innerRadius?.toString() ?? ''}
            onChange={onInnerRadiusChanged}
            min={10}
            step={5}
        />
    );
};
