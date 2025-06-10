import { Field } from '@fluentui/react-components';
import {
    BorderNoneFilled,
    BorderNoneRegular,
    CircleFilled,
    CircleRegular,
    SquareFilled,
    SquareRegular,
    bundleIcon,
} from '@fluentui/react-icons';
import React from 'react';
import { useScene } from '../SceneProvider';
import { Segment, SegmentedGroup } from '../Segmented';
import { SpinButton } from '../SpinButton';
import { useSpinChanged } from '../prefabs/useSpinChanged';
import { ArenaShape } from '../scene';
import { useControlStyles } from '../useControlStyles';

const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const SquareIcon = bundleIcon(SquareFilled, SquareRegular);
const BorderNoneIcon = bundleIcon(BorderNoneFilled, BorderNoneRegular);

export const ArenaShapeEdit: React.FC = () => {
    const classes = useControlStyles();
    const { scene, dispatch } = useScene();
    const { shape, width, height, padding } = scene.arena;

    const onWidthChanged = useSpinChanged((value) => dispatch({ type: 'arenaWidth', value }));
    const onHeightChanged = useSpinChanged((value) => dispatch({ type: 'arenaHeight', value }));
    const onPaddingChanged = useSpinChanged((value) => dispatch({ type: 'arenaPadding', value }));

    return (
        <div className={classes.column}>
            <div className={classes.row}>
                <Field label="Arena shape" className={classes.cell}>
                    <SegmentedGroup
                        name="arena-shape"
                        value={shape}
                        onChange={(ev, data) => dispatch({ type: 'arenaShape', value: data.value as ArenaShape })}
                    >
                        <Segment value={ArenaShape.None} icon={<BorderNoneIcon />} title="None" />
                        <Segment value={ArenaShape.Circle} icon={<CircleIcon />} title="Circle" />
                        <Segment value={ArenaShape.Rectangle} icon={<SquareIcon />} title="Rectangle" />
                    </SegmentedGroup>
                </Field>
                <Field label="Padding" className={classes.cell}>
                    <SpinButton min={0} max={500} step={10} value={padding} onChange={onPaddingChanged} />
                </Field>
            </div>
            <div className={classes.row}>
                <Field label="Width">
                    <SpinButton min={50} max={2000} step={50} value={width} onChange={onWidthChanged} />
                </Field>
                <Field label="Height">
                    <SpinButton min={50} max={2000} step={50} value={height} onChange={onHeightChanged} />
                </Field>
            </div>
        </div>
    );
};
