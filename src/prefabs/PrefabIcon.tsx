import { createFocusOutlineStyle, Image, makeStyles, mergeClasses, type ImageProps } from '@fluentui/react-components';
import React, { useEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { getDragOffset, getDropAction } from '../DropHandler';
import type { SceneObjectPrototype } from '../scene';
import { useScene } from '../SceneProvider';
import { selectNewObjects, useSelection } from '../selection';
import { usePanelDrag } from '../usePanelDrag';
import { round } from '../util';
import { ObjectDragPreview } from './ObjectDragPreview';
import { getObjectPreviewDragOffset, getObjectPreviewMouseOffset } from './objectDragUtil';
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
     * Gets the properties of an object to create on the scene. All properties
     * except for the ID and position must be set. The ID and position will be
     * filled in when the object is created.
     *
     * If the button is activated by double clicking or pressing Enter, the
     * object is created in the center of the scene.
     */
    object: SceneObjectPrototype;

    /**
     * If true, renders the object centered on the mouse pointer when dragging
     * instead of using the default browser behavior of using the PrefabIcon
     * element itself as the drag image.
     *
     * This should be set on any objects whose appearance does not exactly match
     * the PrefabIcon.
     */
    renderDrag?: boolean;
}

export const PrefabIcon: React.FC<PrefabIconProps> = ({ object, className, renderDrag, ...props }) => {
    const { scene, dispatch } = useScene();
    const [, setSelection] = useSelection();
    const [, setDragObject] = usePanelDrag();
    const ref = useRef<HTMLDivElement>(null);

    const dragContainerRef = useRef<HTMLDivElement | null>(null);
    const dragRootRef = useRef<Root | null>(null);
    const [isDragging, setIsDragging] = useState(false);

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

    // Firefox can't be normal and provide the same mouse coordinates in the drag event
    // as it does for dragstart/dragend, so we have to attach a pointermove handler to
    // the window whenever we are dragging instead.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=505521
    useEffect(() => {
        if (isDragging) {
            const handlePointerMove = (e: DragEvent) => {
                if (dragContainerRef.current) {
                    setDragContainerPosition(dragContainerRef.current, e, object);
                }
            };

            window.addEventListener('dragover', handlePointerMove);

            return () => {
                window.removeEventListener('dragover', handlePointerMove);
            };
        }
    }, [isDragging, object]);

    return (
        <PrefabIconBase
            ref={ref}
            className={mergeClasses(className, classes.draggable, classes.focusIndicator)}
            draggable
            tabIndex={0}
            onDragStart={(e) => {
                setDragObject({
                    object,
                    offset: renderDrag ? getObjectPreviewDragOffset(object) : getDragOffset(e),
                });

                if (renderDrag) {
                    // setDragImage() creates a snapshot of an element at the time it is called,
                    // but some object types contain dynamic images that don't load immediately,
                    // so we need to replace the drag image with an empty image and create a
                    // separate element that we move with the pointer.
                    e.dataTransfer.setDragImage(EMPTY_IMAGE, 0, 0);

                    const container = createDragContainer();
                    const root = createRoot(container);
                    root.render(<ObjectDragPreview object={object} />);

                    setDragContainerPosition(container, e, object);

                    dragContainerRef.current = container;
                    dragRootRef.current = root;

                    setIsDragging(true);
                }
            }}
            onDragEnd={() => {
                if (dragContainerRef.current) {
                    dragContainerRef.current.remove();
                    dragContainerRef.current = null;
                }
                if (dragRootRef.current) {
                    dragRootRef.current.unmount();
                    dragRootRef.current = null;
                }

                setIsDragging(false);
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
    onDragEnd,
    onDrag,
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
            onDragEnd={onDragEnd}
            onDrag={onDrag}
            onDoubleClick={onDoubleClick}
            onKeyDown={onKeyDown}
            title={title ?? name}
        >
            {typeof icon === 'string' ? <Image {...props} fit="contain" src={icon} /> : icon}
        </div>
    );
};

const EMPTY_IMAGE = (function () {
    const image = new window.Image();
    image.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    return image;
})();

const useStyles = makeStyles({
    draggable: {
        position: 'relative',
        zIndex: 1,
        cursor: 'grab',
        touchAction: 'none',
    },
    focusIndicator: createFocusOutlineStyle({}),
});

function createDragContainer() {
    const container = document.createElement('div');

    container.style.position = 'absolute';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0.65';

    document.body.appendChild(container);

    return container;
}

// For reasons that are a mystery to me, there is a 1px horizontal difference
// between the position of the drag image and the position of the created object
// on Chromium-based browsers, but only at 100% display scaling. With the window
// moved to a monitor with 175% scaling or when using Firefox, the object goes
// exactly where it is dropped. I'm not sure how to account for this, so for now
// don't try to do anything.

function setDragContainerPosition(
    container: HTMLElement,
    event: MouseEvent | DragEvent | React.DragEvent,
    object: SceneObjectPrototype,
) {
    const offset = round(getObjectPreviewMouseOffset(object));

    container.style.left = `${event.pageX - offset.x}px`;
    container.style.top = `${event.pageY - offset.y}px`;
}
