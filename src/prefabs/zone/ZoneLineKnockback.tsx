import Konva from 'konva';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';
import icon from '../../assets/zone/line_knockback.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/LayerList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { useCanvasCoord } from '../../render/coord';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY } from '../../render/SceneTheme';
import { ObjectType, RectangleZone } from '../../scene';
import { PrefabIcon } from '../PrefabIcon';
import { ChevronTail } from './shapes';
import { getArrowStyle, getZoneStyle } from './style';

const DEFAULT_SIZE = 150;

export const ZoneLineKnockback: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name="Line knockback"
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.LineKnockback,
                        width: DEFAULT_SIZE,
                        height: DEFAULT_SIZE,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.LineKnockback, (object, position) => {
    return {
        type: 'zones',
        op: 'add',
        value: {
            type: ObjectType.Rect,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_SIZE,
            height: DEFAULT_SIZE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const OFFSCREEN_X = -1000;
const OFFSCREEN_Y = -1000;

const PATTERN_W = 50;
const PATTERN_H = 50;
const ARROW_W = 25;
const ARROW_H = 15;

const LineKnockbackRenderer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const [pattern, setPattern] = useState<HTMLImageElement>();
    const center = useCanvasCoord(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, Math.min(object.width, object.height)),
        [object.color, object.opacity, object.width, object.height],
    );
    const arrow = useMemo(() => getArrowStyle(object.color, object.opacity * 3), [object.color, object.opacity]);
    const { fill, ...stroke } = style;

    const arrowRef = useRef<Konva.Group>(null);
    useEffect(() => {
        arrowRef.current?.toImage({
            // This seems like a hack. Is there a better way to draw offscreen?
            x: OFFSCREEN_X,
            y: OFFSCREEN_Y,
            width: PATTERN_W,
            height: PATTERN_H,
            callback: setPattern,
        });
    }, [fill, arrow, object.opacity, arrowRef]);

    return (
        <>
            <Rect
                x={center.x}
                y={center.y}
                offsetX={object.width / 2}
                offsetY={object.height / 2}
                width={object.width}
                height={object.height}
                rotation={object.rotation}
                fillPatternImage={pattern}
                fillPatternOffsetX={PATTERN_W / 2}
                fillPatternOffsetY={PATTERN_H / 2}
                fillPatternX={object.width / 2}
                fillPatternY={object.height / 2}
                fillPatternRepeat="repeat"
                {...stroke}
            />
            <Group ref={arrowRef} x={OFFSCREEN_X} y={OFFSCREEN_Y}>
                <Rect width={PATTERN_W} height={PATTERN_H} fill={fill} />
                <ChevronTail
                    width={ARROW_W}
                    height={ARROW_H}
                    chevronAngle={40}
                    x={PATTERN_W / 2}
                    y={PATTERN_H / 2 + ARROW_H}
                    rotation={180}
                    opacity={(object.opacity * 2) / 100}
                    {...arrow}
                />
            </Group>
        </>
    );
};

registerRenderer<RectangleZone>(ObjectType.LineKnockback, LineKnockbackRenderer);

const LineKnockbackDetails: React.FC<ListComponentProps<RectangleZone>> = ({ layer, index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Line knockback" layer={layer} index={index} />;
};

registerListComponent<RectangleZone>(ObjectType.LineKnockback, LineKnockbackDetails);

// Properties control registered in ZoneRectangle.tsx
