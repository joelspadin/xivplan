import { IChoiceGroupOption, IIconStyles } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { CompactChoiceGroup } from '../../CompactChoiceGroup';
import { useScene } from '../../SceneProvider';
import { EnemyObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

enum RingStyle {
    Directional = 'directional',
    Omnidirectional = 'omnidirectional',
}

const rotateIconStyle: IIconStyles = {
    root: {
        transform: 'rotate(135deg)',
    },
};

const directionalOptions: IChoiceGroupOption[] = [
    // TODO: use CircleShape whenever icon font gets fixed.
    { key: RingStyle.Omnidirectional, text: 'Omnidirectional', iconProps: { iconName: 'CircleRing' } },
    {
        key: RingStyle.Directional,
        text: 'Directional',
        iconProps: { iconName: 'ThreeQuarterCircle', styles: rotateIconStyle },
    },
];

export const EnemyRingControl: React.FC<PropertiesControlProps<EnemyObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const omniDirection = useMemo(() => commonValue(objects, (obj) => obj.omniDirection), [objects]);

    const onDirectionalChanged = useCallback(
        (option: RingStyle) => {
            const omniDirection = option === RingStyle.Omnidirectional;
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, omniDirection })) });
        },
        [dispatch, objects],
    );

    const directionalKey = omniDirection ? RingStyle.Omnidirectional : RingStyle.Directional;

    return (
        <CompactChoiceGroup
            label="Style"
            options={directionalOptions}
            selectedKey={directionalKey}
            onChange={(e, option) => onDirectionalChanged(option?.key as RingStyle)}
        />
    );
};
