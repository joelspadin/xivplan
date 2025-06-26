import { Field } from '@fluentui/react-components';
import React, { useCallback, useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { TowerZone } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const TowerCountControl: React.FC<PropertiesControlProps<TowerZone>> = ({ objects }) => {
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
                <Segment value="1" icon="1" size="mediumText" title="One player" />
                <Segment value="2" icon="2" size="mediumText" title="Two players" />
                <Segment value="3" icon="3" size="mediumText" title="Three players" />
                <Segment value="4" icon="4" size="mediumText" title="Four players" />
            </SegmentedGroup>
        </Field>
    );
};
