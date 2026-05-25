import { Field } from '@fluentui/react-components';
import React from 'react';
import { SpinButton } from '../../SpinButton';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import {
    EXAFLARE_LENGTH_MAX,
    EXAFLARE_LENGTH_MIN,
    EXAFLARE_SPACING_MAX,
    EXAFLARE_SPACING_MIN,
} from '../../prefabs/zone/constants';
import type { ExaflareZone } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const ExaflareLengthControl: React.FC<PropertiesControlProps<ExaflareZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const length = commonValue(objects, (obj) => obj.length);

    const onLengthChanged = (length: number) => update({ props: { length } });

    return (
        <Field label="Length" className={classes.cell}>
            <SpinButton
                value={length}
                onValueChange={onLengthChanged}
                min={EXAFLARE_LENGTH_MIN}
                max={EXAFLARE_LENGTH_MAX}
                step={1}
            />
        </Field>
    );
};

export const ExaflareSpacingControl: React.FC<PropertiesControlProps<ExaflareZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const spacing = commonValue(objects, (obj) => obj.spacing);

    const onSpacingChanged = (spacing: number) => update({ props: { spacing } });

    return (
        <Field label="Spacing" className={classes.cell}>
            <SpinButtonUnits
                value={spacing}
                suffix="%"
                onValueChange={onSpacingChanged}
                min={EXAFLARE_SPACING_MIN}
                max={EXAFLARE_SPACING_MAX}
                step={10}
            />
        </Field>
    );
};
