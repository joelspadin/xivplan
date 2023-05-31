import { IImageProps, IImageStyles, Image } from '@fluentui/react';
import React from 'react';
import { PREFAB_ICON_SIZE } from './PrefabIconStyles';

const draggableProps: Partial<IImageStyles> = {
    root: {
        cursor: 'grab',
    },
};

export interface PrefabIconProps extends IImageProps {
    icon: string;
    name?: string;
    filter?: string;
    size?: number;
}

export const PrefabIcon: React.FC<PrefabIconProps> = ({ icon, name, filter, size, ...props }) => {
    return (
        <Image
            {...props}
            src={icon}
            title={name}
            width={size ?? PREFAB_ICON_SIZE}
            height={size ?? PREFAB_ICON_SIZE}
            styles={props.draggable ? draggableProps : undefined}
            style={{ filter }}
        />
    );
};
