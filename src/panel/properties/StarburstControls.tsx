import { IStyle, Position, SpinButton, mergeStyleSets } from '@fluentui/react';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { MIN_STARBURST_SPOKE_WIDTH } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { StarburstZone } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const MIN_SPOKE_COUNT = 3;
const MAX_SPOKE_COUNT = 16;

const classNames = mergeStyleSets({
    padded: {
        marginRight: 32 + 10,
    } as IStyle,
});

export const StarburstSpokeWidthControl: React.FC<PropertiesControlProps<StarburstZone>> = ({ objects }) => {
    const { dispatch } = useScene();

    const spokeWidth = useMemo(() => commonValue(objects, (obj) => obj.spokeWidth), [objects]);

    const onSpokeWidthChanged = useSpinChanged(
        (spokeWidth: number) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, spokeWidth })) }),
        [dispatch, objects],
    );

    return (
        <SpinButton
            className={classNames.padded}
            label={'Spoke width'}
            labelPosition={Position.top}
            value={spokeWidth?.toString() ?? ''}
            onChange={onSpokeWidthChanged}
            min={MIN_STARBURST_SPOKE_WIDTH}
            step={5}
        />
    );
};

export const StarburstSpokeCountControl: React.FC<PropertiesControlProps<StarburstZone>> = ({ objects }) => {
    const { dispatch } = useScene();

    const spokes = useMemo(() => commonValue(objects, (obj) => obj.spokes), [objects]);

    const onSpokesChanged = useSpinChanged(
        (spokes: number) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, spokes })) }),
        [dispatch, objects],
    );

    return (
        <SpinButton
            className={classNames.padded}
            label={'Spokes'}
            labelPosition={Position.top}
            value={spokes?.toString() ?? ''}
            onChange={onSpokesChanged}
            min={MIN_SPOKE_COUNT}
            max={MAX_SPOKE_COUNT}
            step={1}
        />
    );
};
