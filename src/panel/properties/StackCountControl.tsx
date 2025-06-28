import { Field } from '@fluentui/react-components';
import React, { useCallback, useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { StackCountObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const STACK_VALUES = [1, 2, 3, 4];

export const StackCountControl: React.FC<PropertiesControlProps<StackCountObject>> = ({ objects }) => {
    const classes = useControlStyles();
    const { dispatch } = useScene();

    const count = useMemo(() => commonValue(objects, (obj) => obj.count), [objects]);

    const handleChanged = useCallback(
        (count: number) => {
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, count })) });
        },
        [dispatch, objects],
    );

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

    return `${number} Player${count == 1 ? 's' : ''}`;
}
