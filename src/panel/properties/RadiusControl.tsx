import { Field } from '@fluentui/react-components';
import React from 'react';
import { useScene } from '../../SceneProvider';
import { SpinButton } from '../../SpinButton';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { InnerRadiusObject, RadiusObject, isInnerRadiusObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const RadiusControl: React.FC<PropertiesControlProps<RadiusObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const radius = commonValue(objects, (obj) => obj.radius);
    const hasInnerRadius = objects.every(isInnerRadiusObject);

    const onRadiusChanged = useSpinChanged((radius: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, radius })) }),
    );

    const label = hasInnerRadius ? 'Radius 1' : 'Radius';

    return (
        <Field label={label} className={classes.cell}>
            <SpinButton value={radius} onChange={onRadiusChanged} min={10} step={5} />
        </Field>
    );
};

export const InnerRadiusControl: React.FC<PropertiesControlProps<InnerRadiusObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const innerRadius = commonValue(objects, (obj) => obj.innerRadius);

    const onInnerRadiusChanged = useSpinChanged((innerRadius: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, innerRadius })) }),
    );

    return (
        <Field label="Radius 2" className={classes.cell}>
            <SpinButton value={innerRadius} onChange={onInnerRadiusChanged} min={10} step={5} />
        </Field>
    );
};
