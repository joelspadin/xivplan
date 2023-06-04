import { IChoiceGroupOption } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { CompactChoiceGroup } from '../../CompactChoiceGroup';
import { useScene } from '../../SceneProvider';
import { MarkerObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const shapeOptions: IChoiceGroupOption[] = [
    // TODO: use CircleShape and SquareShape whenever icon font gets fixed.
    { key: 'circle', text: 'Circle', iconProps: { iconName: 'CircleRing' } },
    { key: 'square', text: 'Square', iconProps: { iconName: 'Checkbox' } },
];

export const MarkerShapeControl: React.FC<PropertiesControlProps<MarkerObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const shape = useMemo(() => commonValue(objects, (obj) => obj.shape), [objects]);

    const onShapeChanged = useCallback(
        (option?: IChoiceGroupOption) => {
            const shape = (option?.key as 'circle' | 'square') ?? 'square';
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, shape })) });
        },
        [dispatch, objects],
    );

    return (
        <CompactChoiceGroup
            label="Shape"
            options={shapeOptions}
            selectedKey={shape}
            onChange={(ev, option) => onShapeChanged(option)}
        />
    );
};
