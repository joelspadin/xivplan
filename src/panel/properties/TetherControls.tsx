import { Field } from '@fluentui/react-components';
import React, { useCallback, useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { SpinButton } from '../../SpinButton';
import { getTetherName } from '../../prefabs/TetherConfig';
import { TetherIcon } from '../../prefabs/TetherIcon';
import { MIN_TETHER_WIDTH } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { Tether, TetherType } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const TETHER_TYPES = [
    TetherType.Line,
    TetherType.Close,
    TetherType.Far,
    TetherType.MinusMinus,
    TetherType.PlusMinus,
    TetherType.PlusPlus,
];

export const TetherTypeControl: React.FC<PropertiesControlProps<Tether>> = ({ objects }) => {
    const { dispatch } = useScene();

    const tether = useMemo(() => commonValue(objects, (obj) => obj.tether), [objects]);

    const onTetherChanged = useCallback(
        (tether: TetherType) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, tether })) }),
        [dispatch, objects],
    );

    return (
        <Field label="Tether type">
            <SegmentedGroup
                name="tether-type"
                value={tether}
                onChange={(ev, data) => onTetherChanged(data.value as TetherType)}
            >
                {TETHER_TYPES.map((item) => (
                    <Segment
                        key={item}
                        value={item}
                        icon={<TetherIcon tetherType={item} />}
                        size="large"
                        title={getTetherName(item)}
                    />
                ))}
            </SegmentedGroup>
        </Field>
    );
};

export const TetherWidthControl: React.FC<PropertiesControlProps<Tether>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const width = useMemo(() => commonValue(objects, (obj) => obj.width), [objects]);

    const onWidthChanged = useSpinChanged((width: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, width })) }),
    );

    return (
        <Field label="Width" className={classes.cell}>
            <SpinButton value={width} onChange={onWidthChanged} min={MIN_TETHER_WIDTH} step={2} />
        </Field>
    );
};
