import { IImageProps, IImageStyles, Image, ImageFit } from '@fluentui/react';
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
    width?: number;
    height?: number;
}

export const PrefabIcon: React.FC<PrefabIconProps> = ({ icon, name, filter, width, height, ...props }) => {
    return (
        <Image
            {...props}
            imageFit={ImageFit.centerContain}
            src={icon}
            title={name}
            width={width ?? PREFAB_ICON_SIZE}
            height={height ?? PREFAB_ICON_SIZE}
            styles={props.draggable ? draggableProps : undefined}
            style={{ filter }}
        />
    );
};
