import { Field, makeStyles } from '@fluentui/react-components';
import { CircleFilled, CircleRegular, bundleIcon } from '@fluentui/react-icons';
import React, { useCallback, useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { ThreeQuarterCircleFilled, ThreeQuarterCircleRegular } from '../../icon/ThreeQuarterCircle';
import { EnemyObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

enum RingStyle {
    Directional = 'directional',
    Omnidirectional = 'omnidirectional',
}

const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const ThreeQuarterCircleIcon = bundleIcon(ThreeQuarterCircleFilled, ThreeQuarterCircleRegular);

const DirectionalIcon: React.FC = () => {
    const classes = useStyles();
    return <ThreeQuarterCircleIcon className={classes.directional} />;
};

export const EnemyRingControl: React.FC<PropertiesControlProps<EnemyObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const omniDirection = useMemo(() => commonValue(objects, (obj) => obj.omniDirection), [objects]);

    const onDirectionalChanged = useCallback(
        (option: RingStyle) => {
            const omniDirection = option === RingStyle.Omnidirectional;
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, omniDirection })) });
        },
        [dispatch, objects],
    );

    const directionalKey = omniDirection ? RingStyle.Omnidirectional : RingStyle.Directional;

    return (
        <Field label="Ring style" className={classes.cell}>
            <SegmentedGroup
                name="enemy-ring"
                value={directionalKey}
                onChange={(ev, data) => onDirectionalChanged(data.value as RingStyle)}
            >
                <Segment value={RingStyle.Omnidirectional} icon={<CircleIcon />} title="Omnidirectional" />
                <Segment value={RingStyle.Directional} icon={<DirectionalIcon />} title="Directional" />
            </SegmentedGroup>
        </Field>
    );
};

const useStyles = makeStyles({
    directional: {
        transform: 'rotate(135deg)',
    },
});
