import { getColorFromString, updateA } from '@fluentui/react';
import { ShapeConfig } from 'konva/lib/Shape';
import React, { useMemo, useState } from 'react';
import { Circle, Group, Line, Path, Wedge } from 'react-konva';
import icon from '../../assets/zone/falloff.png';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { GroundPortal } from '../../render/Portals';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { CircleZone, ObjectType } from '../../scene';
import { useIsSelected } from '../../SelectionProvider';
import { degtorad } from '../../util';
import { DraggableObject } from '../DraggableObject';
import { PrefabIcon } from '../PrefabIcon';
import { getArrowStyle, getShadowColor } from './style';

const DEFAULT_RADIUS = 200;

export const ZoneProximity: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Proximity AOE"
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Proximity,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<CircleZone>(ObjectType.Proximity, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Proximity,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        },
    };
});

const FlareCorner: React.FC<ShapeConfig> = ({ ...props }) => {
    return <Path data="M4-6H6V-4H7V-7H4" {...props} listening={false} />;
};

const ARROW_A = 50;
const ARROW_W = 20;
const ARROW_H = 8;
const SPOKE_H = 20;
const SPOKE_A = 10;

function getArrowPoints() {
    const a = degtorad(ARROW_A);
    const x1 = Math.cos(a) * ARROW_W;
    const y1 = Math.sin(a) * ARROW_W;
    const x2 = x1 - Math.cos(a) * ARROW_H;
    const y2 = y1 + Math.sin(a) * ARROW_H;
    const y3 = ARROW_H / Math.cos(a);
    // prettier-ignore
    return [
        0, 0,
        x1, y1,
        x2, y2,
        0, y3,
        -x2, y2,
        -x1, y1,
    ];
}

const FlareArrow: React.FC<ShapeConfig> = ({ ...props }) => {
    const { offsetX, offsetY, rotation, shadowColor, ...arrowProps } = props;
    const points = useMemo(() => getArrowPoints(), []);

    return (
        <Group offsetX={offsetX} offsetY={offsetY} rotation={rotation} listening={false}>
            <Line points={points} closed={true} {...arrowProps} fill={shadowColor} offsetY={-4} />
            <Line points={points} closed={true} {...arrowProps} />
            <Wedge
                rotation={-90 - SPOKE_A / 2}
                angle={SPOKE_A}
                radius={SPOKE_H}
                y={SPOKE_H + ARROW_H * 2}
                fill={shadowColor}
            />
        </Group>
    );
};

const CORNER_ANGLES = [0, 90, 180, 270];
const ARROW_ANGLES = [0, 120, 240];
const SCALE1 = 1;
const SCALE2 = 2;

function getGradient(color: string, opacity: number) {
    const c = getColorFromString(color);
    if (!c) {
        return [0, color];
    }

    const center = updateA(c, opacity).str;
    const edge = updateA(c, 5).str;

    return [0, center, 1, edge];
}

function getShadowOffset(i: number): ShapeConfig {
    switch (i) {
        case 0:
            return { shadowOffsetX: -0.5, shadowOffsetY: 0.5 };
        case 1:
            return { shadowOffsetX: -0.5, shadowOffsetY: -0.5 };
        case 2:
            return { shadowOffsetX: 0.5, shadowOffsetY: -0.5 };
        default:
            return { shadowOffsetX: 0.5, shadowOffsetY: 0.5 };
    }
}

const ProximityRenderer: React.FC<RendererProps<CircleZone>> = ({ object, index }) => {
    const isSelected = useIsSelected(index);
    const [active, setActive] = useState(false);
    const gradient = useMemo(
        () =>
            ({
                fillRadialGradientColorStops: getGradient(object.color, object.opacity),
                fillRadialGradientStartRadius: 0,
                fillRadialGradientEndRadius: object.radius,
            } as ShapeConfig),
        [object.color, object.opacity, object.radius],
    );
    const arrow = useMemo(() => getArrowStyle(object.color, object.opacity * 3), [object.color, object.opacity]);
    const shadowColor = useMemo(() => getShadowColor(object.color), [object.color]);

    return (
        <GroundPortal isActive={active}>
            <DraggableObject object={object} index={index} onActive={setActive}>
                {isSelected && <Circle radius={object.radius} {...SELECTED_PROPS} />}

                <Circle radius={object.radius} {...gradient} />
                {CORNER_ANGLES.map((r, i) => (
                    <Group key={i} rotation={r}>
                        <FlareCorner scaleX={SCALE1} scaleY={SCALE1} {...arrow} />
                        <FlareCorner
                            scaleX={SCALE2}
                            scaleY={SCALE2}
                            {...arrow}
                            shadowColor={shadowColor}
                            {...getShadowOffset(i)}
                        />
                    </Group>
                ))}
                {ARROW_ANGLES.map((r, i) => (
                    <Group key={i} rotation={r}>
                        <FlareArrow offsetY={60} {...arrow} shadowColor={shadowColor} />
                    </Group>
                ))}
            </DraggableObject>
        </GroundPortal>
    );
};

registerRenderer<CircleZone>(ObjectType.Proximity, ProximityRenderer);

const ProximityDetails: React.FC<ListComponentProps<CircleZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Proximity AOE" index={index} />;
};

registerListComponent<CircleZone>(ObjectType.Proximity, ProximityDetails);

// Properties control registered in ZoneCircle.tsx
