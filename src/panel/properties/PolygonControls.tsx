import { Position, SpinButton } from '@fluentui/react';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { MAX_POLYGON_SIDES, MIN_POLYGON_SIDES } from '../../prefabs/bounds';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { PolygonZone } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const PolygonSidesControl: React.FC<PropertiesControlProps<PolygonZone>> = ({ objects }) => {
    const { dispatch } = useScene();

    const spokes = useMemo(() => commonValue(objects, (obj) => obj.sides), [objects]);

    const onSidesChanged = useSpinChanged(
        (sides: number) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, sides })) }),
        [dispatch, objects],
    );

    return (
        <SpinButton
            label={'Sides'}
            labelPosition={Position.top}
            value={spokes?.toString() ?? ''}
            onChange={onSidesChanged}
            min={MIN_POLYGON_SIDES}
            max={MAX_POLYGON_SIDES}
            step={1}
        />
    );
};
