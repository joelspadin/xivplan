import { Field, makeStyles } from '@fluentui/react-components';
import {
    ChevronCircleUpFilled,
    ChevronCircleUpRegular,
    CircleFilled,
    CircleRegular,
    bundleIcon,
} from '@fluentui/react-icons';
import React, { useCallback, useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { ThreeQuarterCircleFilled, ThreeQuarterCircleRegular } from '../../icon/ThreeQuarterCircle';
import { EnemyObject, EnemyRingStyle } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const ChevronCircleUpIcon = bundleIcon(ChevronCircleUpFilled, ChevronCircleUpRegular);
const ThreeQuarterCircleIcon = bundleIcon(ThreeQuarterCircleFilled, ThreeQuarterCircleRegular);

const DirectionalIcon: React.FC = () => {
    const classes = useStyles();
    return <ThreeQuarterCircleIcon className={classes.directional} />;
};

export const EnemyRingControl: React.FC<PropertiesControlProps<EnemyObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const ring = useMemo(() => commonValue(objects, (obj) => obj.ring), [objects]);

    const onDirectionalChanged = useCallback(
        (ring: EnemyRingStyle) => {
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, ring })) });
        },
        [dispatch, objects],
    );

    return (
        <Field label="Ring style" className={classes.cell}>
            <SegmentedGroup
                name="enemy-ring"
                value={ring}
                onChange={(ev, data) => onDirectionalChanged(data.value as EnemyRingStyle)}
            >
                <Segment value={EnemyRingStyle.Directional} icon={<DirectionalIcon />} title="Directional" />
                <Segment
                    value={EnemyRingStyle.Omnidirectional}
                    icon={<ChevronCircleUpIcon />}
                    title="Omnidirectional"
                />
                <Segment value={EnemyRingStyle.NoDirection} icon={<CircleIcon />} title="No direction" />
            </SegmentedGroup>
        </Field>
    );
};

const useStyles = makeStyles({
    directional: {
        transform: 'rotate(135deg)',
    },
});
