import { Field } from '@fluentui/react-components';
import React from 'react';
import { SpinButton } from '../../SpinButton';
import { type InnerRadiusObject, type RadiusObject, isInnerRadiusObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const RadiusControl: React.FC<PropertiesControlProps<RadiusObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const radius = commonValue(objects, (obj) => obj.radius);
    const hasInnerRadius = objects.every(isInnerRadiusObject);

    const onRadiusChanged = (radius: number) => update({ props: { radius } });

    const label = hasInnerRadius ? 'Radius 1' : 'Radius';

    return (
        <Field label={label} className={classes.cell}>
            <SpinButton value={radius} onValueChange={onRadiusChanged} min={10} step={5} />
        </Field>
    );
};

export const InnerRadiusControl: React.FC<PropertiesControlProps<InnerRadiusObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const innerRadius = commonValue(objects, (obj) => obj.innerRadius);

    const onInnerRadiusChanged = (innerRadius: number) => update({ props: { innerRadius } });

    return (
        <Field label="Radius 2" className={classes.cell}>
            <SpinButton value={innerRadius} onValueChange={onInnerRadiusChanged} min={10} step={5} />
        </Field>
    );
};
