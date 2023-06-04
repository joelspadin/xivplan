import { IStyle, Position, SpinButton, mergeStyleSets } from '@fluentui/react';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { ExaflareZone } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const MIN_LENGTH = 2;

const classNames = mergeStyleSets({
    padded: {
        marginRight: 32 + 10,
    } as IStyle,
});

export const ExaflareLengthControl: React.FC<PropertiesControlProps<ExaflareZone>> = ({ objects }) => {
    const { dispatch } = useScene();

    const length = useMemo(() => commonValue(objects, (obj) => obj.length), [objects]);

    const onLengthChanged = useSpinChanged(
        (length: number) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, length })) }),
        [dispatch, objects],
    );

    return (
        <SpinButton
            className={classNames.padded}
            label="Length"
            labelPosition={Position.top}
            value={length?.toString() ?? ''}
            onChange={onLengthChanged}
            min={MIN_LENGTH}
            step={1}
        />
    );
};
