import React, { useMemo } from 'react';
import { Group, Rect } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import lineIcon from '../../assets/zone/line.png';
import squareIcon from '../../assets/zone/square.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../../render/ObjectRegistry';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { LayerName } from '../../render/layers';
import { ObjectType, RectangleZone } from '../../scene';
import { usePanelDrag } from '../../usePanelDrag';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';
import { useShowHighlight } from '../highlight';
import { getZoneStyle } from './style';

const NAME = 'Rectangle';

const DEFAULT_SQUARE_SIZE = 150;

export const ZoneSquare: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={squareIcon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Rect,
                        width: DEFAULT_SQUARE_SIZE,
                        height: DEFAULT_SQUARE_SIZE,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

const DEFAULT_LINE_WIDTH = 50;
const DEFAULT_LINE_HEIGHT = 250;

export const ZoneLine: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Line AOE"
            icon={lineIcon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Rect,
                        width: DEFAULT_LINE_WIDTH,
                        height: DEFAULT_LINE_HEIGHT,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.Rect, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Rect,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_SQUARE_SIZE,
            height: DEFAULT_SQUARE_SIZE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const RectangleRenderer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const showHighlight = useShowHighlight(object);

    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, Math.min(object.width, object.height), object.hollow),
        [object],
    );

    const highlightOffset = style.strokeWidth;
    const highlightWidth = object.width + highlightOffset;
    const highlightHeight = object.height + highlightOffset;

    return (
        <ResizeableObjectContainer object={object} transformerProps={{ keepRatio: false }}>
            {(groupProps) => (
                <Group {...groupProps}>
                    {showHighlight && (
                        <Rect
                            offsetX={highlightOffset / 2}
                            offsetY={highlightOffset / 2}
                            width={highlightWidth}
                            height={highlightHeight}
                            {...SELECTED_PROPS}
                        />
                    )}
                    <Rect width={object.width} height={object.height} {...style} />
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<RectangleZone>(ObjectType.Rect, LayerName.Ground, RectangleRenderer);

const RectangleDetails: React.FC<ListComponentProps<RectangleZone>> = ({ object, ...props }) => {
    return <DetailsItem icon={squareIcon} name={NAME} object={object} color={object.color} {...props} />;
};

registerListComponent<RectangleZone>(ObjectType.Rect, RectangleDetails);
