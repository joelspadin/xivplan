import { IChoiceGroupOption, IChoiceGroupProps } from '@fluentui/react';
import React from 'react';
import { CompactChoiceGroup } from '../../CompactChoiceGroup';

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
