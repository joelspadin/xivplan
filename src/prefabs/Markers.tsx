import * as React from 'react';
import { Ellipse, Group, Image, Rect } from 'react-konva';
import useImage from 'use-image';
import { DetailsItem } from '../panel/LayerItem';
import { registerListComponent } from '../panel/LayerList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../PanelDragProvider';
import { ALIGN_TO_PIXEL, useCanvasCoord } from '../render/coord';
import { registerRenderer } from '../render/ObjectRenderer';
import { MarkerObject } from '../scene';
import { SceneAction } from '../SceneProvider';
import { PrefabIcon } from './PrefabIcon';

const DEFAULT_SIZE = 42;
const ICON_RATIO = 32 / DEFAULT_SIZE;
const MARKER_TYPE = 'marker';

const COLOR_RED = '#f13b66';
const COLOR_YELLOW = '#e1dc5d';
const COLOR_BLUE = '#65b3ea';
const COLOR_PURPLE = '#e291e6';

function makeIcon(name: string, icon: string, shape: 'circle' | 'square', color: string) {
    // eslint-disable-next-line react/display-name
    return () => {
        const [, setDragObject] = usePanelDrag();
        const iconUrl = new URL(`../assets/marker/${icon}`, import.meta.url).toString();

        return (
            <PrefabIcon
                draggable
                name={name}
                icon={iconUrl}
                onDragStart={(e) => {
                    setDragObject({
                        type: MARKER_TYPE,
                        object: {
                            type: 'marker',
                            image: iconUrl,
                            name,
                            color,
                            shape,
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
}

registerDropHandler<MarkerObject>(MARKER_TYPE, (object, position) => {
    return {
        type: 'markers',
        op: 'add',
        value: {
            type: 'marker',
            image: '',
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            rotation: 0,
            ...object,
            ...position,
        } as MarkerObject,
    } as SceneAction;
});

function getDashSize(object: MarkerObject) {
    switch (object.shape) {
        case 'square':
            return (object.width + object.height) / 2 / 8;

        case 'circle': {
            const a = object.width / 2;
            const b = object.height / 2;
            const perimiter = 2 * Math.PI * Math.sqrt((a * a + b * b) / 2);
            return perimiter / 24;
        }
    }
}

registerRenderer<MarkerObject>(MARKER_TYPE, ({ object }) => {
    const [image] = useImage(object.image);
    const center = useCanvasCoord(object);

    const iconWidth = object.width * ICON_RATIO;
    const iconHeight = object.height * ICON_RATIO;

    const dashSize = getDashSize(object);
    const strokeProps = {
        stroke: object.color,
        strokeWidth: 1,
        shadowColor: object.color,
        shadowBlur: 2,
        dash: [dashSize, dashSize],
    };

    return (
        <Group x={center.x} y={center.y} rotation={object.rotation}>
            {object.shape === 'circle' && (
                <Ellipse radiusX={object.width / 2} radiusY={object.height / 2} {...strokeProps} />
            )}
            {object.shape === 'square' && (
                <Rect
                    x={-object.width / 2}
                    y={-object.height / 2}
                    width={object.width}
                    height={object.height}
                    dashOffset={dashSize / 2}
                    {...strokeProps}
                    {...ALIGN_TO_PIXEL}
                />
            )}
            <Image
                image={image}
                width={iconWidth}
                height={iconHeight}
                offsetX={iconWidth / 2}
                offsetY={iconHeight / 2}
            />
        </Group>
    );
});

registerListComponent<MarkerObject>(MARKER_TYPE, ({ object }) => {
    return <DetailsItem icon={object.image} name={object.name} />;
});

export const WaymarkA = makeIcon('Waymark A', 'waymark_a.png', 'circle', COLOR_RED);
export const WaymarkB = makeIcon('Waymark B', 'waymark_b.png', 'circle', COLOR_YELLOW);
export const WaymarkC = makeIcon('Waymark C', 'waymark_c.png', 'circle', COLOR_BLUE);
export const WaymarkD = makeIcon('Waymark D', 'waymark_d.png', 'circle', COLOR_PURPLE);
export const Waymark1 = makeIcon('Waymark 1', 'waymark_1.png', 'square', COLOR_RED);
export const Waymark2 = makeIcon('Waymark 2', 'waymark_2.png', 'square', COLOR_YELLOW);
export const Waymark3 = makeIcon('Waymark 3', 'waymark_3.png', 'square', COLOR_BLUE);
export const Waymark4 = makeIcon('Waymark 4', 'waymark_4.png', 'square', COLOR_PURPLE);
