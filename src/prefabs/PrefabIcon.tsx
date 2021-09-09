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
}

export const PrefabIcon: React.FunctionComponent<PrefabIconProps> = ({ icon, name, ...props }) => {
    return (
        <Image
            {...props}
            src={icon}
            title={name}
            width={PREFAB_ICON_SIZE}
            height={PREFAB_ICON_SIZE}
            styles={props.draggable ? draggableProps : undefined}
        />
    );
};
