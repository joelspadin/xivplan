import { Field } from '@fluentui/react-components';
import React from 'react';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { MAX_CONE_ANGLE, MIN_CONE_ANGLE } from '../../prefabs/bounds';
import type { ArcZone, ConeZone } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const ConeAngleControl: React.FC<PropertiesControlProps<ArcZone | ConeZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const coneAngle = commonValue(objects, (obj) => obj.coneAngle);

    const onAngleChanged = (coneAngle: number) => update({ props: { coneAngle } });

    return (
        <Field label="Angle" className={classes.cell}>
            <SpinButtonUnits
                value={coneAngle}
                onValueChange={onAngleChanged}
                min={MIN_CONE_ANGLE}
                max={MAX_CONE_ANGLE}
                step={5}
                fractionDigits={1}
                suffix="°"
            />
        </Field>
    );
};
