import { Field, makeStyles } from '@fluentui/react-components';
import { bundleIcon, SquareFilled, SquareRegular } from '@fluentui/react-icons';
import React, { useCallback, useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { SpinButton } from '../../SpinButton';
import { MAX_POLYGON_SIDES, MIN_POLYGON_SIDES } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { PolygonOrientation, PolygonZone } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const Square = bundleIcon(SquareFilled, SquareRegular);

export const PolygonSidesControl: React.FC<PropertiesControlProps<PolygonZone>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const spokes = useMemo(() => commonValue(objects, (obj) => obj.sides), [objects]);

    const onSidesChanged = useSpinChanged((sides: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, sides })) }),
    );

    return (
        <Field label="Sides" className={classes.cell}>
            <SpinButton
                value={spokes}
                onChange={onSidesChanged}
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
    const { dispatch } = useScene();

    const orient = useMemo(() => commonValue(objects, (obj) => obj.orient), [objects]);

    const handleChanged = useCallback(
        (orient: PolygonOrientation) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, orient })) }),
        [dispatch, objects],
    );

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
