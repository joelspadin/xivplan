import { Field } from '@fluentui/react-components';
import { ChevronDoubleDownRegular, ChevronDownRegular } from '@fluentui/react-icons';
import React from 'react';
import { BooleanSegment, BooleanSegmentedGroup, Segment, SegmentedGroup } from '../../Segmented';
import type { MultiHitObject, StackCountObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

const STACK_VALUES = [1, 2, 3, 4];

export const StackCountControl: React.FC<PropertiesControlProps<StackCountObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const count = commonValue(objects, (obj) => obj.count);

    const handleChanged = (count: number) => update({ props: { count } });

    return (
        <Field label="Player count" className={classes.cell}>
            <SegmentedGroup
                name="player-count"
                value={String(count)}
                onChange={(ev, data) => handleChanged(parseInt(data.value))}
            >
                {STACK_VALUES.map((i) => (
                    <Segment
                        key={i}
                        value={i.toString()}
                        icon={i.toString()}
                        size="mediumText"
                        title={getItemTitle(i)}
                    />
                ))}
            </SegmentedGroup>
        </Field>
    );
};

const NUMBERS = ['One', 'Two', 'Three', 'Four'];

function getItemTitle(count: number) {
    const number = NUMBERS[count - 1] ?? '';

    return `${number} Player${count != 1 ? 's' : ''}`;
}

export const StackMultiHitControl: React.FC<PropertiesControlProps<MultiHitObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const update = useObjectUpdater(objects);

    const isMultiHit = commonValue(objects, (obj) => obj.multiHit ?? false);

    const valueChanged = (newValue: boolean) =>
        newValue ? update({ props: { multiHit: true } }) : update({ omit: ['multiHit'] });

    return (
        <Field label="Multi-hit" className={classes.cell}>
            <BooleanSegmentedGroup
                name="multi-hit"
                value={isMultiHit}
                onChange={(ev, data) => valueChanged(data.value)}
            >
                <BooleanSegment value={false} icon={<ChevronDownRegular />} title="Single hit" />
                <BooleanSegment value={true} icon={<ChevronDoubleDownRegular />} title="Multiple hits" />
            </BooleanSegmentedGroup>
        </Field>
    );
};
