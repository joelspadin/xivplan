import { Position } from '@fluentui/react';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { TowerZone } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const MIN_COUNT = 1;
const MAX_COUNT = 4;

export const TowerCountControl: React.FC<PropertiesControlProps<TowerZone>> = ({ objects }) => {
    const { dispatch } = useScene();

    const count = useMemo(() => commonValue(objects, (obj) => obj.count), [objects]);

    const onCountChanged = useSpinChanged(
        (count: number) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, count })) }),
        [dispatch, objects],
    );

    const soakSuffix = count === 1 ? ' player' : ' players';

    return (
        <SpinButtonUnits
            label="Soak count"
            labelPosition={Position.top}
            value={count?.toString() ?? ''}
            onChange={onCountChanged}
            min={MIN_COUNT}
            max={MAX_COUNT}
            step={1}
            suffix={soakSuffix}
        />
    );
};
