import Konva from 'konva';
import type { ShapeConfig } from 'konva/lib/Shape';
import type { TextConfig } from 'konva/lib/shapes/Text';
import * as React from 'react';
import { type RefObject, useRef } from 'react';
import { Arc, Circle, Group, Image, Line, Path, Text } from 'react-konva';
import { registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { type ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { registerRenderer, type RendererProps } from '../render/ObjectRegistry';
import { LayerName } from '../render/layers';
import {
    EnemyIconStyle,
    type EnemyObject,
    EnemyRingStyle,
    getEnemyIconUrl,
    isRotateAllowed,
    ObjectType,
} from '../scene';
import {
    CENTER_DOT_RADIUS,
    DEFAULT_ENEMY_COLOR,
    DEFAULT_ENEMY_OPACITY,
    getEnemyTextConfig,
    useSceneTheme,
} from '../theme';
import { useKonvaCache } from '../useKonvaCache';
import { useImageTracked } from '../useObjectLoading';
import { makeDisplayName } from '../util';
import { HideGroup } from './HideGroup';
import { PrefabIcon } from './PrefabIcon';
import { RadiusObjectContainer } from './RadiusObjectContainer';
import { useHighlightProps, useOverrideProps } from './highlight';

// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/103
/* eslint-disable react-refresh/only-export-components */

const DEFAULT_SIZE = 32;

const SIZE_SMALL = 20;
const SIZE_MEDIUM = 50;
const SIZE_LARGE = 80;
const SIZE_HUGE = 300;

const RING_ANGLE = 270;
const RING_ROTATION = 135;
const OUTER_STROKE_RATIO = 1 / 32;
const OUTER_STROKE_MIN = 2;
const INNER_RADIUS_RATIO = 0.8;
const INNER_STROKE_MIN = 1;
const INNER_STROKE_RATIO = 1 / 64;
const SHADOW_BLUR_RATIO = 1 / 10;
const SHADOW_BLUR_MIN = 2;

function makeIcon(name: string, icon: EnemyIconStyle, radius: number, ring: EnemyRingStyle, rotation?: number) {
    const Component: React.FC = () => {
        return (
            <PrefabIcon
                name={name}
                icon={getEnemyIconUrl(icon)}
                object={{
                    type: ObjectType.Enemy,
                    icon,
                    radius,
                    rotation: rotation ?? 0,
                    ring,
                }}
            />
        );
    };
    Component.displayName = makeDisplayName(name);
    return Component;
}

registerDropHandler<EnemyObject>(ObjectType.Enemy, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Enemy,
            icon: EnemyIconStyle.NoIcon,
            name: '',
            color: DEFAULT_ENEMY_COLOR,
            opacity: DEFAULT_ENEMY_OPACITY,
            radius: DEFAULT_SIZE,
            status: [],
            ...object,
            ...position,
        },
    };
});

interface RingProps extends ShapeConfig {
    name?: string;
    radius: number;
    color: string;

    // These may be unused for plain-circle rings
    rotation: number;
    groupRef: RefObject<Konva.Group | null>;
}

interface EnemyLabelProps extends TextConfig {
    name?: string;
    radius: number;
    icon: EnemyIconStyle;
}

const EnemyLabel: React.FC<EnemyLabelProps> = ({ name, radius, icon, ...props }) => {
    if (radius < 32) {
        return null;
    }

    const fontSize = Math.max(10, Math.min(24, radius / 6));
    const strokeWidth = Math.max(1, fontSize / 8);

    return (
        <Text
            text={name}
            width={radius * 2}
            height={radius * 2}
            offsetX={radius}
            offsetY={icon === EnemyIconStyle.NoIcon ? radius : radius * 1.5}
            fontSize={fontSize}
            strokeWidth={strokeWidth}
            align="center"
            verticalAlign="middle"
            fillAfterStrokeEnabled
            listening={false}
            {...props}
        />
    );
};

interface EnemyIconProps {
    icon: EnemyIconStyle;
    radius: number;
    rotation: number;
}

const EnemyIcon: React.FC<EnemyIconProps> = ({ icon, radius, rotation }) => {
    const [image] = useImageTracked(getEnemyIconUrl(icon));
    return (
        <Image
            image={image}
            width={radius}
            height={radius}
            rotation={rotation}
            offsetX={radius / 2}
            offsetY={radius / 2}
        />
    );
};

function getInnerRadius(radius: number) {
    return Math.min(radius - 4, radius * INNER_RADIUS_RATIO);
}

function getOuterRadius(radius: number, strokeWidth: number) {
    return radius - strokeWidth / 2;
}

function getShapeProps(color: string, radius: number, strokeRatio: number, minStroke: number) {
    const strokeWidth = Math.max(minStroke, radius * strokeRatio);
    const shadowBlur = Math.max(SHADOW_BLUR_MIN, radius * SHADOW_BLUR_RATIO);

    return {
        stroke: color,
        strokeWidth: strokeWidth,
        shadowColor: color,
        shadowBlur: shadowBlur,
        shadowOpacity: 0.5,
    };
}

const CircleRing: React.FC<RingProps> = ({ radius, color, opacity, ...props }) => {
    const outerProps = getShapeProps(color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
    const innerRadius = getInnerRadius(radius);
    const outerRadius = getOuterRadius(radius, outerProps.strokeWidth);

    return (
        <HideGroup opacity={opacity} {...props}>
            <Circle {...outerProps} radius={outerRadius} />
            <Circle {...innerProps} radius={innerRadius} />
        </HideGroup>
    );
};

const DirectionalRing: React.FC<RingProps> = ({ radius, color, opacity, rotation, groupRef, ...props }) => {
    const outerProps = getShapeProps(color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
    const innerRadius = getInnerRadius(radius);
    const outerRadius = getOuterRadius(radius, outerProps.strokeWidth);
    const arrowScale = radius / 32;

    // Cache so overlapping shapes with opacity appear as one object.
    useKonvaCache(groupRef, [radius, color]);

    return (
        <HideGroup opacity={opacity} ref={groupRef} rotation={rotation} {...props}>
            <Circle radius={radius} fill="transparent" />
            <Arc
                {...outerProps}
                rotation={RING_ROTATION}
                angle={RING_ANGLE}
                innerRadius={outerRadius}
                outerRadius={outerRadius}
            />
            <Arc
                {...innerProps}
                rotation={RING_ROTATION}
                angle={RING_ANGLE}
                innerRadius={innerRadius}
                outerRadius={innerRadius}
            />
            <Path
                data="M0-41c-2 2-4 7-4 10 4 0 4 0 8 0 0-3-2-8-4-10"
                scaleX={arrowScale}
                scaleY={arrowScale}
                strokeEnabled={false}
                fill={color}
            />
            <SideArrows
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                innerStrokeWidth={innerProps.strokeWidth}
                outerStrokeWidth={outerProps.strokeWidth}
                color={color}
                {...innerProps}
            />
        </HideGroup>
    );
};

const OmnidirectionalRing: React.FC<RingProps> = ({ radius, color, opacity, rotation, groupRef, ...props }) => {
    const outerProps = getShapeProps(color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
    const innerRadius = getInnerRadius(radius);
    const outerRadius = getOuterRadius(radius, outerProps.strokeWidth);
    const arrowScale = radius / 42;

    // Cache so overlapping shapes with opacity appear as one object.
    useKonvaCache(groupRef, [radius, color]);

    return (
        <HideGroup opacity={opacity} ref={groupRef} rotation={rotation} {...props}>
            <Circle radius={radius} fill="transparent" />

            <Circle {...outerProps} radius={outerRadius} />
            <Circle {...innerProps} radius={innerRadius} />

            <Path
                data="M0-40c-2 2-4 7-4 10l4-2L4-30c0-3-2-8-4-10"
                scaleX={arrowScale}
                scaleY={arrowScale}
                strokeEnabled={false}
                fill={color}
            />

            <SideArrows
                {...innerProps}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                innerStrokeWidth={innerProps.strokeWidth}
                outerStrokeWidth={outerProps.strokeWidth}
                color={color}
            />
        </HideGroup>
    );
};

interface SideArrowProps {
    innerRadius: number;
    outerRadius: number;
    outerStrokeWidth: number;
    innerStrokeWidth: number;
    color: string;
}

const SideArrows: React.FC<SideArrowProps> = ({
    innerRadius,
    outerRadius,
    outerStrokeWidth,
    innerStrokeWidth,
    color,
    ...innerProps
}) => {
    if (outerRadius < 20) {
        return null;
    }
    const sideArrowDistance = (innerRadius + innerStrokeWidth / 2 + outerRadius - outerStrokeWidth / 2) / 2;
    const sideArrowWidth = outerRadius - sideArrowDistance - outerStrokeWidth / 2;

    const largerArrowPoints = [-sideArrowWidth, 0, 0, -sideArrowWidth * 1.5, sideArrowWidth, 0];
    const smallerArrowPoints = [-sideArrowWidth / 2, sideArrowWidth / 2, 0, 0, sideArrowWidth / 2, sideArrowWidth / 2];
    return (
        <>
            <Group offsetX={sideArrowDistance}>
                <Line {...innerProps} points={largerArrowPoints} fill={color} />
                <Line {...innerProps} points={smallerArrowPoints} fill={color} />
            </Group>
            <Group offsetX={-sideArrowDistance}>
                <Line {...innerProps} points={largerArrowPoints} fill={color} />
                <Line {...innerProps} points={smallerArrowPoints} fill={color} />
            </Group>
        </>
    );
};

interface EnemyRendererProps extends RendererProps<EnemyObject> {
    radius: number;
    rotation: number;
    groupRef: RefObject<Konva.Group | null>;
    isDragging?: boolean;
}

function renderRing(
    object: EnemyObject,
    radius: number,
    rotation: number,
    groupRef: RefObject<Konva.Group | null>,
    highlightProps?: ShapeConfig,
    overrideProps?: ShapeConfig,
) {
    let RingType: React.FC<RingProps> | undefined;
    switch (object.ring) {
        case EnemyRingStyle.NoDirection:
            RingType = CircleRing;
            break;
        case EnemyRingStyle.Directional:
            RingType = DirectionalRing;
            break;
        case EnemyRingStyle.Omnidirectional:
            RingType = OmnidirectionalRing;
            break;
    }

    return (
        <>
            {RingType && (
                <RingType
                    radius={radius}
                    rotation={rotation}
                    color={object.color}
                    opacity={object.opacity / 100}
                    highlightProps={highlightProps}
                    overrideProps={overrideProps}
                    groupRef={groupRef}
                    {...overrideProps}
                />
            )}
            {highlightProps && <Circle radius={radius} {...highlightProps} {...overrideProps} />}
        </>
    );
}

const EnemyRenderer: React.FC<EnemyRendererProps> = ({ object, radius, rotation, groupRef, isDragging }) => {
    const highlightProps = useHighlightProps(object);
    const overrideProps = useOverrideProps(object);
    const theme = useSceneTheme();
    const textConfig = getEnemyTextConfig(theme);

    return (
        <>
            <HideGroup {...overrideProps}>
                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={object.color} />}

                <EnemyLabel name={object.name} radius={radius} icon={object.icon} {...textConfig} />
            </HideGroup>

            {object.icon !== EnemyIconStyle.NoIcon && (
                <HideGroup opacity={object.opacity / 100} {...overrideProps}>
                    <EnemyIcon icon={object.icon} radius={radius} rotation={object.rotateIcon ? rotation : 0} />
                </HideGroup>
            )}
            {renderRing(object, radius, rotation, groupRef, highlightProps, overrideProps)}
        </>
    );
};

const EnemyContainer: React.FC<RendererProps<EnemyObject>> = ({ object }) => {
    const groupRef = useRef<Konva.Group>(null);
    const allowRotate = isRotateAllowed(object);

    return (
        <RadiusObjectContainer
            object={object}
            allowRotate={allowRotate}
            onTransformEnd={() => {
                groupRef.current?.clearCache();
            }}
        >
            {({ radius, rotation, isDragging }) => (
                <EnemyRenderer
                    object={object}
                    radius={radius}
                    rotation={rotation}
                    groupRef={groupRef}
                    isDragging={isDragging}
                />
            )}
        </RadiusObjectContainer>
    );
};

registerRenderer<EnemyObject>(ObjectType.Enemy, LayerName.Ground, EnemyContainer);

const EnemyDetails: React.FC<ListComponentProps<EnemyObject>> = ({ object, ...props }) => {
    return <DetailsItem icon={getEnemyIconUrl(object.icon)} name={object.name || 'Enemy'} object={object} {...props} />;
};

registerListComponent<EnemyObject>(ObjectType.Enemy, EnemyDetails);

export const EnemyUnremarkable = makeIcon(
    'Unremarkable enemy',
    EnemyIconStyle.NoIcon,
    SIZE_SMALL,
    EnemyRingStyle.NoDirection,
);
export const EnemySmall = makeIcon('Small enemy', EnemyIconStyle.Small, SIZE_MEDIUM, EnemyRingStyle.Directional);
export const EnemyMedium = makeIcon('Medium enemy', EnemyIconStyle.Medium, SIZE_LARGE, EnemyRingStyle.Directional);
export const EnemyLarge = makeIcon('Large enemy', EnemyIconStyle.Large, SIZE_HUGE, EnemyRingStyle.Omnidirectional, 180);
