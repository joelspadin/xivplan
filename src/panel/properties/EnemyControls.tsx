import { Field, Image, makeStyles, mergeClasses, ToggleButton, Tooltip } from '@fluentui/react-components';
import {
    ArrowClockwiseDashesRegular,
    ArrowSyncOffRegular,
    ArrowSyncRegular,
    bundleIcon,
    ChevronCircleUpFilled,
    ChevronCircleUpRegular,
    CircleFilled,
    CircleRegular,
} from '@fluentui/react-icons';
import { StatusCircleBlockIcon } from '@fluentui/react-icons-mdl2';
import React from 'react';
import { Segment, SegmentedGroup } from '../../Segmented';
import { ThreeQuarterCircleFilled, ThreeQuarterCircleRegular } from '../../icon/ThreeQuarterCircle';
import { EnemyIconStyle, type EnemyObject, EnemyRingStyle, getEnemyIconUrl } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const ChevronCircleUpIcon = bundleIcon(ChevronCircleUpFilled, ChevronCircleUpRegular);
const ThreeQuarterCircleIcon = bundleIcon(ThreeQuarterCircleFilled, ThreeQuarterCircleRegular);

const DirectionalIcon: React.FC = () => {
    const classes = useStyles();
    return <ThreeQuarterCircleIcon className={classes.directional} />;
};

export const EnemyControl: React.FC<PropertiesControlProps<EnemyObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const ring = commonValue(objects, (obj) => obj.ring);
    const icon = commonValue(objects, (obj) => obj.icon);
    const rotateIcon = commonValue(objects, (obj) => obj.rotateIcon ?? false);

    const onDirectionalChanged = (ring: EnemyRingStyle) => update({ props: { ring } });
    const onIconChanged = (icon: EnemyIconStyle) => update({ props: { icon } });
    const handleToggleRotateIcon = () =>
        update(rotateIcon ? { omit: ['rotateIcon'] } : { props: { rotateIcon: true } });

    const rotationTooltip = getRotationTooltip(rotateIcon);
    const rotationIcon = getRotationIcon(rotateIcon);
    const allowNoIcon = objects.every((obj) => obj.ring != EnemyRingStyle.NoRing);
    const allowNoRing = objects.every((obj) => obj.icon != EnemyIconStyle.NoIcon);

    return (
        <>
            <div className={mergeClasses(classes.row, classes.rightGap)}>
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
                        {allowNoRing && (
                            <Segment value={EnemyRingStyle.NoRing} icon={<StatusCircleBlockIcon />} title="No ring" />
                        )}
                    </SegmentedGroup>
                </Field>
            </div>
            <div className={mergeClasses(classes.row, classes.rightGap)}>
                <Field label="Icon style" className={classes.cell}>
                    <SegmentedGroup
                        name="enemy-icon"
                        value={icon}
                        onChange={(ev, data) => onIconChanged(data.value as EnemyIconStyle)}
                    >
                        <EnemySegment value={EnemyIconStyle.Small} />
                        <EnemySegment value={EnemyIconStyle.Medium} />
                        <EnemySegment value={EnemyIconStyle.Large} />
                        {allowNoIcon && <EnemySegment value={EnemyIconStyle.NoIcon} />}
                    </SegmentedGroup>
                </Field>
                {icon !== EnemyIconStyle.NoIcon && (
                    <Tooltip content={rotationTooltip} relationship="label" withArrow>
                        <ToggleButton checked={!!rotateIcon} onClick={handleToggleRotateIcon} icon={rotationIcon} />
                    </Tooltip>
                )}
            </div>
        </>
    );
};

function getRotationTooltip(rotateIcon: boolean | undefined) {
    if (rotateIcon === undefined) {
        return 'Multiple rotation states';
    }

    return rotateIcon ? 'The icon will rotate' : 'The icon will stay upright';
}

function getRotationIcon(rotateIcon: boolean | undefined) {
    if (rotateIcon === undefined) {
        return <ArrowClockwiseDashesRegular />;
    }

    return rotateIcon ? <ArrowSyncRegular /> : <ArrowSyncOffRegular />;
}

interface EnemySegmentProps {
    value: EnemyIconStyle;
}

const EnemySegment: React.FC<EnemySegmentProps> = ({ value }) => {
    const icon = useEnemySegmentIcon(value);
    const tooltip = getEnemySegmentTooltip(value);

    return <Segment value={value} icon={icon} title={tooltip} />;
};

function useEnemySegmentIcon(value: EnemyIconStyle) {
    const classes = useStyles();

    if (value === EnemyIconStyle.NoIcon) {
        return <StatusCircleBlockIcon />;
    }

    return <Image className={classes.imageSegment} src={getEnemyIconUrl(value)} />;
}

function getEnemySegmentTooltip(value: EnemyIconStyle): string {
    switch (value) {
        case EnemyIconStyle.Small:
            return 'Small icon';
        case EnemyIconStyle.Medium:
            return 'Medium icon';
        case EnemyIconStyle.Large:
            return 'Large icon';
        case EnemyIconStyle.NoIcon:
            return 'No icon';
    }
}

const useStyles = makeStyles({
    directional: {
        transform: 'rotate(135deg)',
    },
    imageSegment: {
        width: '30px',
        height: '30px',
    },
});
