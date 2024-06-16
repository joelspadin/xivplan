import { Image, ImageProps, makeStyles, mergeClasses } from '@fluentui/react-components';
import React, { CSSProperties, ReactNode, useMemo } from 'react';
import { PREFAB_ICON_SIZE } from './PrefabIconStyles';

export interface PrefabIconProps extends Omit<ImageProps, 'width' | 'height'> {
    icon: string | ReactNode;
    name?: string;
    filter?: string;
    width?: number;
    height?: number;
}

export const PrefabIcon: React.FC<PrefabIconProps> = ({
    icon,
    name,
    filter,
    width,
    height,
    draggable,
    onDragStart,
    ...props
}) => {
    const classes = useStyles();

    const style = useMemo<CSSProperties>(() => {
        return {
            width: width ?? PREFAB_ICON_SIZE,
            height: height ?? PREFAB_ICON_SIZE,
            fontSize: height ?? PREFAB_ICON_SIZE,
            filter,
        };
    }, [width, height, filter]);

    return (
        <div
            style={style}
            className={mergeClasses(draggable && classes.draggable)}
            draggable={draggable}
            onDragStart={onDragStart}
        >
            {typeof icon === 'string' ? <Image {...props} fit="contain" src={icon} title={name} /> : icon}
        </div>
    );
};

const useStyles = makeStyles({
    draggable: {
        cursor: 'grab',
    },
});
