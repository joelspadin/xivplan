import { Field } from '@fluentui/react-components';
import React from 'react';
import { SpinButton } from '../../SpinButton';
import { MIN_STARBURST_SPOKE_WIDTH } from '../../prefabs/bounds';
import type { StarburstZone } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

const MIN_SPOKE_COUNT = 3;
const MAX_SPOKE_COUNT = 16;

export const StarburstSpokeWidthControl: React.FC<PropertiesControlProps<StarburstZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const spokeWidth = commonValue(objects, (obj) => obj.spokeWidth);

    const onSpokeWidthChanged = (spokeWidth: number) => update({ props: { spokeWidth } });

    return (
        <Field label="Spoke width" className={classes.cell}>
            <SpinButton
                value={spokeWidth}
                onValueChange={onSpokeWidthChanged}
                min={MIN_STARBURST_SPOKE_WIDTH}
                step={5}
            />
        </Field>
    );
};

export const StarburstSpokeCountControl: React.FC<PropertiesControlProps<StarburstZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const spokes = commonValue(objects, (obj) => obj.spokes);

    const onSpokesChanged = (spokes: number) => update({ props: { spokes } });

    return (
        <Field label="Spokes" className={classes.cell}>
            <SpinButton
                value={spokes}
                onValueChange={onSpokesChanged}
                min={MIN_SPOKE_COUNT}
                max={MAX_SPOKE_COUNT}
                step={1}
            />
        </Field>
    );
};
