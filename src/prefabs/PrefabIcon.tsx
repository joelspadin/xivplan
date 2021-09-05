import { Image, IStyle, mergeStyleSets } from '@fluentui/react';
import React from 'react';

export const PREFAB_ICON_SIZE = 32;

const classNames = mergeStyleSets({
    icon: {
        width: PREFAB_ICON_SIZE,
        height: PREFAB_ICON_SIZE,
    } as IStyle,
});

export interface PrefabIconProps {
    icon: string;
    name?: string;
}

export const PrefabIcon: React.FunctionComponent<PrefabIconProps> = ({ icon, name }) => {
    return <Image src={icon} className={classNames.icon} title={name} />;
};
