import { RectConfig } from 'konva/lib/shapes/Rect';
import React, { useMemo } from 'react';
import { Group, Line } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import rightTriangleIcon from '../../assets/zone/right_triangle.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../../render/ObjectRegistry';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { LayerName } from '../../render/layers';
import { ObjectType, RectangleZone } from '../../scene';
import { usePanelDrag } from '../../usePanelDrag';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { ResizeableObjectContainer } from '../ResizeableObjectContainer';
import { useShowHighlight } from '../highlight';
import { getZoneStyle } from './style';

const NAME = 'Right triangle';

const DEFAULT_RIGHT_TRIANGLE_SIZE = 150;

export const ZoneRightTriangle: React.FC = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={rightTriangleIcon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.RightTriangle,
                        width: DEFAULT_RIGHT_TRIANGLE_SIZE,
                        height: DEFAULT_RIGHT_TRIANGLE_SIZE,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.RightTriangle, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.RightTriangle,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_RIGHT_TRIANGLE_SIZE,
            height: DEFAULT_RIGHT_TRIANGLE_SIZE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const RightTriangle: React.FC<RectConfig> = ({ width, height, ...props }) => {
    const points = useMemo(() => {
        const w = width ?? 0;
        const h = height ?? 0;
        // prettier-ignore
        return [
            0, 0,
            0, h,
            w, h
        ];
    }, [width, height]);

    return <Line points={points} closed {...props} />;
};

const RightTriangleRenderer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const showHighlight = useShowHighlight(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, Math.min(object.width, object.height), object.hollow),
        [object.color, object.opacity, object.width, object.height, object.hollow],
    );

    const highlightOffset = style.strokeWidth;
    const highlightWidth = object.width + highlightOffset;
    const highlightHeight = object.height + highlightOffset;

    return (
        <ResizeableObjectContainer object={object}>
            {(groupProps) => (
                <Group {...groupProps}>
                    {showHighlight && (
                        <RightTriangle
                            offsetX={highlightOffset / 2}
                            offsetY={highlightOffset / 2}
                            width={highlightWidth}
                            height={highlightHeight}
                            {...SELECTED_PROPS}
                        />
                    )}
                    <HideGroup>
                        <RightTriangle width={object.width} height={object.height} {...style} />
                    </HideGroup>
                </Group>
            )}
        </ResizeableObjectContainer>
    );
};

registerRenderer<RectangleZone>(ObjectType.RightTriangle, LayerName.Ground, RightTriangleRenderer);

const RightTriangleDetails: React.FC<ListComponentProps<RectangleZone>> = ({ object, ...props }) => {
    return <DetailsItem icon={rightTriangleIcon} name={NAME} object={object} color={object.color} {...props} />;
};

registerListComponent<RectangleZone>(ObjectType.RightTriangle, RightTriangleDetails);
