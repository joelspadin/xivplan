import { Image, makeStyles, mergeClasses, type ImageProps } from '@fluentui/react-components';
import type { Vector2d } from 'konva/lib/types';
import React, { useRef, type CSSProperties, type ReactNode, type Ref } from 'react';
import { getDragOffset, getDropAction } from '../DropHandler';
import type { SceneObject } from '../scene';
import { useScene } from '../SceneProvider';
import { selectNewObjects, useSelection } from '../selection';
import { usePanelDrag } from '../usePanelDrag';
import { PREFAB_ICON_SIZE } from './PrefabIconStyles';

export interface PrefabIconBaseProps extends Omit<ImageProps, 'width' | 'height'> {
    icon: string | ReactNode;
    name?: string;
    title?: string;
    width?: number;
    height?: number;

    ref?: Ref<HTMLDivElement>;
}

export interface PrefabIconProps extends Omit<
    PrefabIconBaseProps,
    'draggable' | 'onDragStart' | 'onDoubleClick' | 'onKeyDown'
> {
    /**
     * Gets the properties of an object to create on the scene. At minimum, the
     * object type must be set. The rest will be filled in by the drag handler
     * for that object type.
     *
     * The getOffset() callback is used to get the offset of the created object
     * from the mouse position when dragging and dropping. If omitted, this
     * defaults to getDragOffset().
     *
     * If the button is activated by double clicking or pressing Enter, the
     * object is created in the center of the scene.
     */
    object: Partial<SceneObject>;
    getOffset?: (e: React.MouseEvent<HTMLElement>) => Vector2d;
}

export const PrefabIcon: React.FC<PrefabIconProps> = ({ object, getOffset, className, ...props }) => {
    const { scene, dispatch } = useScene();
    const [, setSelection] = useSelection();
    const [, setDragObject] = usePanelDrag();
    const ref = useRef<HTMLDivElement>(null);
    const classes = useStyles();

    const createObjectAtCenter = () => {
        const action = getDropAction(
            {
                object,
                offset: { x: 0, y: 0 },
            },
            { x: 0, y: 0 },
        );
        if (action) {
            dispatch(action);
            setSelection(selectNewObjects(scene, 1));

            ref.current?.blur();
        }
    };

    return (
        <PrefabIconBase
            ref={ref}
            className={mergeClasses(className, classes.draggable)}
            draggable
            tabIndex={0}
            onDragStart={(e) => {
                setDragObject({
                    object,
                    offset: getOffset?.(e) ?? getDragOffset(e),
                });
            }}
            onDoubleClick={createObjectAtCenter}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    createObjectAtCenter();
                }
            }}
            {...props}
        />
    );
};

export const PrefabIconBase: React.FC<PrefabIconBaseProps> = ({
    icon,
    name,
    title,
    width,
    height,
    className,
    tabIndex,
    draggable,
    onDragStart,
    onDoubleClick,
    onKeyDown,
    ref,
    ...props
}) => {
    const style: CSSProperties = {
        width: width ?? PREFAB_ICON_SIZE,
        height: height ?? PREFAB_ICON_SIZE,
        fontSize: height ?? PREFAB_ICON_SIZE,
    };

    return (
        <div
            ref={ref}
            style={style}
            className={className}
            draggable={draggable}
            tabIndex={tabIndex}
            onDragStart={onDragStart}
            onDoubleClick={onDoubleClick}
            onKeyDown={onKeyDown}
            title={title ?? name}
        >
            {typeof icon === 'string' ? <Image {...props} fit="contain" src={icon} /> : icon}
        </div>
    );
};

const useStyles = makeStyles({
    draggable: {
        position: 'relative',
        zIndex: 1,
        cursor: 'grab',
        touchAction: 'none',
    },
});
