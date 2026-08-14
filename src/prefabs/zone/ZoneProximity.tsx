import Color from 'colorjs.io';
import type { ShapeConfig } from 'konva/lib/Shape';
import React from 'react';
import { Circle, Group, Line, Path, Wedge } from 'react-konva';
import { registerDropHandler } from '../../DropHandler';
import Icon from '../../assets/zone/falloff.svg?react';
import { DetailsItem } from '../../panel/DetailsItem';
import { type ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { registerRenderer, type RendererProps } from '../../render/ObjectRegistry';
import { LayerName } from '../../render/layers';
import { ObjectType, ProximityStyle, type ProximityZone } from '../../scene';
import { COLOR_BLUE_WHITE, DEFAULT_AOE_OPACITY, panelVars } from '../../theme';
import { degtorad } from '../../util';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { useHighlightProps, useOverrideProps } from '../highlight';
import { OffsetArc } from './shapes';
import { getArrowStyle, getShadowColor, getZoneStyle } from './style';

const DEFAULT_RADIUS = 200;
// (inner circle radius. outsets arcs add 5)
const DEFAULT_FLOOR_PROXIMITY_CIRCLE_RADIUS = 25;

export const ZoneProximity: React.FC = () => {
    return (
        <PrefabIcon
            name="Proximity AOE"
            icon={<Icon />}
            object={{
                type: ObjectType.Proximity,
            }}
        />
    );
};

registerDropHandler<ProximityZone>(ObjectType.Proximity, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Proximity,
            color: COLOR_BLUE_WHITE,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        } as ProximityZone,
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
    const points = getArrowPoints();

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
    const c = new Color(color);

    const center = c
        .clone()
        .set('alpha', opacity / 100)
        .display();

    const edge = c.clone().set('alpha', 0.05).display();

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

interface ProximityRendererProps extends RendererProps<ProximityZone> {
    radius: number;
    isDragging?: boolean;
}

const ProximityRenderer: React.FC<ProximityRendererProps> = ({ object, radius, ...props }) => {
    const highlightProps = useHighlightProps(object);
    const overrideProps = useOverrideProps(object);
    const gradient: ShapeConfig = {
        fillRadialGradientColorStops: getGradient(object.color, object.opacity),
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndRadius: radius,
    };

    return (
        <>
            {highlightProps && <Circle radius={radius} {...highlightProps} {...overrideProps} />}

            <HideGroup {...overrideProps}>
                <Circle radius={radius} {...gradient} />

                {(object.proximityStyle === undefined || object.proximityStyle == ProximityStyle.Player) && (
                    <PlayerProximityMarker object={object} radius={radius} {...props} />
                )}

                {object.proximityStyle == ProximityStyle.Ground && (
                    <FloorProximityMarker object={object} radius={radius} {...props} />
                )}
            </HideGroup>
        </>
    );
};

const PlayerProximityMarker: React.FC<ProximityRendererProps> = ({ object, radius }) => {
    const arrow = getArrowStyle(object.color, object.opacity * 3);
    const shadowColor = getShadowColor(object.color);

    const arrowScale = Math.max(1, radius / DEFAULT_RADIUS);
    return (
        <Group scaleX={arrowScale} scaleY={arrowScale}>
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
        </Group>
    );
};

const FloorProximityMarker: React.FC<ProximityRendererProps> = ({ object, radius }) => {
    const floorCircleScale = Math.max(0.5, radius / DEFAULT_RADIUS);
    const floorCircleStyle = getZoneStyle(
        object.color,
        1.15 * object.opacity,
        DEFAULT_FLOOR_PROXIMITY_CIRCLE_RADIUS,
        false,
    );
    const floorCircleArcStyle = getZoneStyle(
        object.color,
        2.5 * object.opacity,
        DEFAULT_FLOOR_PROXIMITY_CIRCLE_RADIUS + 5,
        false,
    );
    return (
        <Group scaleX={floorCircleScale} scaleY={floorCircleScale}>
            <Circle radius={DEFAULT_FLOOR_PROXIMITY_CIRCLE_RADIUS} {...floorCircleStyle} />
            {CORNER_ANGLES.map((r, i) => (
                <Group key={i} rotation={r - 30}>
                    <OffsetArc
                        angle={60}
                        innerRadius={DEFAULT_FLOOR_PROXIMITY_CIRCLE_RADIUS + 2}
                        outerRadius={DEFAULT_FLOOR_PROXIMITY_CIRCLE_RADIUS + 5}
                        shapeOffset={0}
                        {...floorCircleArcStyle}
                        strokeWidth={0}
                    />
                </Group>
            ))}
        </Group>
    );
};

const ProximityContainer: React.FC<RendererProps<ProximityZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object}>
            {(props) => <ProximityRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<ProximityZone>(ObjectType.Proximity, LayerName.Ground, ProximityContainer);

const ProximityDetails: React.FC<ListComponentProps<ProximityZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [panelVars.colorZoneOrange]: object.color }} />}
            name="Proximity AOE"
            object={object}
            {...props}
        />
    );
};

registerListComponent<ProximityZone>(ObjectType.Proximity, ProximityDetails);
