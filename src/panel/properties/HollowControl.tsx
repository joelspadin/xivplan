import { IChoiceGroupOption, IChoiceGroupProps } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { CompactChoiceGroup } from '../../CompactChoiceGroup';
import { useScene } from '../../SceneProvider';
import { HollowObject } from '../../scene';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const HollowControl: React.FC<PropertiesControlProps<HollowObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const hollow = useMemo(() => commonValue(objects, (obj) => !!obj.hollow), [objects]);

    const onHollowChanged = useCallback(
        (hollow: boolean) =>
            dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'hollow', hollow)) }),
        [dispatch, objects],
    );

    return <HollowToggle label="Style" checked={hollow} onChange={onHollowChanged} />;
};

export interface HollowToggleProps extends Omit<IChoiceGroupProps, 'onChange'> {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}

enum Styles {
    Solid = 'solid',
    Hollow = 'hollow',
}

const styleOptions: IChoiceGroupOption[] = [
    // TODO: use CircleShape whenever icon font gets fixed.
    { key: Styles.Solid, text: 'Solid', iconProps: { iconName: 'CircleShapeSolid' } },
    { key: Styles.Hollow, text: 'Hollow', iconProps: { iconName: 'CircleRing' } },
];

export const HollowToggle: React.FC<HollowToggleProps> = ({ checked, onChange, ...props }) => {
    const selectedKey = checked ? Styles.Hollow : Styles.Solid;

    return (
        <CompactChoiceGroup
            options={styleOptions}
            selectedKey={selectedKey}
            onChange={(e, option) => onChange?.(option?.key === Styles.Hollow)}
            {...props}
        />
    );
};
