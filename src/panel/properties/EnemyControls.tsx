import { IChoiceGroupOption, IIconStyles } from '@fluentui/react';
import { Field } from '@fluentui/react-components';
import React, { useCallback, useMemo } from 'react';
import { CompactChoiceGroup } from '../../CompactChoiceGroup';
import { useScene } from '../../SceneProvider';
import { EnemyObject } from '../../scene';
import { useControlStyles } from '../../useControlStyles';
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
    const classes = useControlStyles();
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
        <Field label="Ring style" className={classes.cell}>
            <CompactChoiceGroup
                options={directionalOptions}
                selectedKey={directionalKey}
                onChange={(e, option) => onDirectionalChanged(option?.key as RingStyle)}
            />
        </Field>
    );
};
