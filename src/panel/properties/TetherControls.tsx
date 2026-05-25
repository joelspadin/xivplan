import { Field } from '@fluentui/react-components';
import React from 'react';
import { Segment, SegmentedGroup } from '../../Segmented';
import { SpinButton } from '../../SpinButton';
import { getTetherName } from '../../prefabs/TetherConfig';
import { TetherIcon } from '../../prefabs/TetherIcon';
import { MIN_TETHER_WIDTH } from '../../prefabs/bounds';
import { type Tether, TetherType } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

const TETHER_TYPES = [
    TetherType.Line,
    TetherType.Close,
    TetherType.Far,
    TetherType.MinusMinus,
    TetherType.PlusMinus,
    TetherType.PlusPlus,
];

export const TetherTypeControl: React.FC<PropertiesControlProps<Tether>> = ({ objects }) => {
    const update = useObjectUpdater(objects);

    const tether = commonValue(objects, (obj) => obj.tether);

    const onTetherChanged = (tether: TetherType) => update({ props: { tether } });

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
    const update = useObjectUpdater(objects);

    const width = commonValue(objects, (obj) => obj.width);

    const onWidthChanged = (width: number) => update({ props: { width } });

    return (
        <Field label="Width" className={classes.cell}>
            <SpinButton value={width} onValueChange={onWidthChanged} min={MIN_TETHER_WIDTH} step={2} />
        </Field>
    );
};
