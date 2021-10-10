import { RectConfig } from 'konva/lib/shapes/Rect';
import React, { useMemo, useState } from 'react';
import { Line } from 'react-konva';
import rightTriangleIcon from '../../assets/zone/right_triangle.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { ActivePortal } from '../../render/Portals';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { ObjectType, RectangleZone } from '../../scene';
import { useIsSelected } from '../../SelectionProvider';
import { DraggableObject } from '../DraggableObject';
import { PrefabIcon } from '../PrefabIcon';
import { getZoneStyle } from './style';

const NAME = 'Right triangle';

const DEFAULT_RIGHT_TRIANGLE_SIZE = 150;

export const ZoneRightTriangle: React.FunctionComponent = () => {
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

const RightTriangleRenderer: React.FC<RendererProps<RectangleZone>> = ({ object, index }) => {
    const isSelected = useIsSelected(index);
    const [active, setActive] = useState(false);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, Math.min(object.width, object.height), object.hollow),
        [object.color, object.opacity, object.width, object.height, object.hollow],
    );

    const highlightWidth = object.width + style.strokeWidth;
    const highlightHeight = object.height + style.strokeWidth;

    return (
        <ActivePortal isActive={active}>
            <DraggableObject object={object} index={index} onActive={setActive}>
                {isSelected && (
                    <RightTriangle
                        offsetX={highlightWidth / 2}
                        offsetY={highlightHeight / 2}
                        width={highlightWidth}
                        height={highlightHeight}
                        rotation={object.rotation}
                        {...SELECTED_PROPS}
                    />
                )}
                <RightTriangle
                    offsetX={object.width / 2}
                    offsetY={object.height / 2}
                    width={object.width}
                    height={object.height}
                    rotation={object.rotation}
                    {...style}
                />
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<RectangleZone>(ObjectType.RightTriangle, LayerName.Ground, RightTriangleRenderer);

const RightTriangleDetails: React.FC<ListComponentProps<RectangleZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={rightTriangleIcon} name={NAME} index={index} />;
};

registerListComponent<RectangleZone>(ObjectType.RightTriangle, RightTriangleDetails);

// Properties control registered in ZoneRectangle.tsx
