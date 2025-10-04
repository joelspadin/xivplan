import { RectConfig } from 'konva/lib/shapes/Rect';
import React from 'react';
import { Group, Line } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/triangle.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { ObjectType, RectangleZone } from '../../scene';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';
import { useHighlightProps } from '../highlight';
import { getZoneStyle } from './style';

const NAME = 'Triangle';

const DEFAULT_TRIANGLE_WIDTH = 100;
const DEFAULT_TRIANGLE_HEIGHT = Math.floor((DEFAULT_TRIANGLE_WIDTH * Math.sqrt(3)) / 2);

export const ZoneTriangle: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={<Icon />}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Triangle,
                        width: DEFAULT_TRIANGLE_WIDTH,
                        height: DEFAULT_TRIANGLE_HEIGHT,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.Triangle, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Triangle,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_TRIANGLE_WIDTH,
            height: DEFAULT_TRIANGLE_HEIGHT,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const EquilateralTriangle: React.FC<RectConfig> = ({ width, height, ...props }) => {
    const w = width ?? 0;
    const h = height ?? 0;
    // prettier-ignore
    const points = [
        w / 2, 0,
        0, h,
        w, h
    ];

    return <Line points={points} closed {...props} />;
};

const TriangleRenderer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const highlightProps = useHighlightProps(object);
    const style = getZoneStyle(object.color, object.opacity, Math.min(object.width, object.height), object.hollow);

    const highlightOffset = style.strokeWidth;
    const highlightWidth = object.width + highlightOffset;
    const highlightHeight = object.height + highlightOffset;

    const offsetY = (object.height * 2) / 3;

    return (
        <ResizeableObjectContainer object={object} transformerProps={{ centeredScaling: true }}>
            {(groupProps) => (
                <Group {...groupProps} offsetY={offsetY}>
                    {highlightProps && (
                        <EquilateralTriangle
                            offsetX={highlightOffset / 2}
                            offsetY={highlightOffset / 2}
                            width={highlightWidth}
                            height={highlightHeight}
                            {...highlightProps}
                        />
                    )}
                    <HideGroup>
                        <EquilateralTriangle width={object.width} height={object.height} {...style} />
                    </HideGroup>
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<RectangleZone>(ObjectType.Triangle, LayerName.Ground, TriangleRenderer);

const TriangleDetails: React.FC<ListComponentProps<RectangleZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<RectangleZone>(ObjectType.Triangle, TriangleDetails);
