import { Field, makeStyles } from '@fluentui/react-components';
import { bundleIcon, SquareFilled, SquareRegular } from '@fluentui/react-icons';
import React from 'react';
import { Segment, SegmentedGroup } from '../../Segmented';
import { SpinButton } from '../../SpinButton';
import { MAX_POLYGON_SIDES, MIN_POLYGON_SIDES } from '../../prefabs/bounds';
import type { PolygonOrientation, PolygonZone } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

const Square = bundleIcon(SquareFilled, SquareRegular);

export const PolygonSidesControl: React.FC<PropertiesControlProps<PolygonZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const spokes = commonValue(objects, (obj) => obj.sides);

    const onSidesChanged = (sides: number) => update({ props: { sides } });

    return (
        <Field label="Sides" className={classes.cell}>
            <SpinButton
                value={spokes}
                onValueChange={onSidesChanged}
                min={MIN_POLYGON_SIDES}
                max={MAX_POLYGON_SIDES}
                step={1}
            />
        </Field>
    );
};

export const PolygonOrientationControl: React.FC<PropertiesControlProps<PolygonZone>> = ({ objects }) => {
    const classes = useStyles();
    const controlClasses = useControlStyles();
    const update = useObjectUpdater(objects);

    const orient = commonValue(objects, (obj) => obj.orient);

    const handleChanged = (orient: PolygonOrientation) => update({ props: { orient } });

    return (
        <Field label="Orientation" className={controlClasses.cell}>
            <SegmentedGroup
                name="player-count"
                value={orient ?? ''}
                onChange={(ev, data) => handleChanged(data.value as PolygonOrientation)}
            >
                <Segment value="point" icon={<Square className={classes.point} />} title="Point up" />
                <Segment value="side" icon={<Square />} title="Side up" />
            </SegmentedGroup>
        </Field>
    );
};

const useStyles = makeStyles({
    point: {
        transform: 'rotate(45deg)',
    },
});
