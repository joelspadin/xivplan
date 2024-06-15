import { Field, SpinButton } from '@fluentui/react-components';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { InnerRadiusObject, RadiusObject, isInnerRadiusObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
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
        <Field label={label}>
            <SpinButton
                value={radius ?? 0}
                displayValue={radius?.toString() ?? ''}
                onChange={onRadiusChanged}
                min={10}
                step={5}
            />
        </Field>
    );
};

export const InnerRadiusControl: React.FC<PropertiesControlProps<InnerRadiusObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const innerRadius = useMemo(() => commonValue(objects, (obj) => obj.innerRadius), [objects]);

    const onInnerRadiusChanged = useSpinChanged((innerRadius: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, innerRadius })) }),
    );

    return (
        <Field label="Radius 2" className={classes.rightGap}>
            <SpinButton
                value={innerRadius ?? 0}
                displayValue={innerRadius?.toString() ?? ''}
                onChange={onInnerRadiusChanged}
                min={10}
                step={5}
            />
        </Field>
    );
};
