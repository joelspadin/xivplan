import { IImageProps, IImageStyles, Image } from '@fluentui/react';
import React from 'react';

export const PREFAB_ICON_SIZE = 32;

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

export const PrefabIcon: React.FunctionComponent<PrefabIconProps> = ({ icon, name, filter, size, ...props }) => {
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
