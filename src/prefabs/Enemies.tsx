import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';
import * as React from 'react';
import { RefObject, useRef } from 'react';
import { Arc, Circle, Path, Text } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../render/ObjectRegistry';
import {
    CENTER_DOT_RADIUS,
    DEFAULT_ENEMY_COLOR,
    DEFAULT_ENEMY_OPACITY,
    EnemyTheme,
    SELECTED_PROPS,
    useSceneTheme,
} from '../render/SceneTheme';
import { LayerName } from '../render/layers';
import { EnemyObject, EnemyRingStyle, ObjectType } from '../scene';
import { useKonvaCache } from '../useKonvaCache';
import { usePanelDrag } from '../usePanelDrag';
import { makeDisplayName } from '../util';
import { HideGroup } from './HideGroup';
import { PrefabIcon } from './PrefabIcon';
import { RadiusObjectContainer } from './RadiusObjectContainer';
import { useShowHighlight } from './highlight';

const DEFAULT_SIZE = 32;

const SIZE_SMALL = 20;
const SIZE_MEDIUM = 50;
const SIZE_LARGE = 80;
const SIZE_HUGE = 300;

const RING_ANGLE = 270;
const RING_ROTATION = 135;
const OUTER_STROKE_RATIO = 1 / 32;
const OUTER_STROKE_MIN = 2;
const INNER_RADIUS_RATIO = 0.85;
const INNER_STROKE_MIN = 1;
const INNER_STROKE_RATIO = 1 / 64;
const SHADOW_BLUR_RATIO = 1 / 10;
const SHADOW_BLUR_MIN = 2;

function makeIcon(name: string, icon: string, radius: number, hasDirection = true) {
    const Component: React.FC = () => {
        const [, setDragObject] = usePanelDrag();
        const iconUrl = `/actor/${icon}`;

        return (
            <PrefabIcon
                draggable
                name={name}
                icon={iconUrl}
                onDragStart={(e) => {
                    setDragObject({
                        object: {
                            type: ObjectType.Enemy,
                            icon: iconUrl,
                            radius: radius,
                            rotation: 0,
                            ring: hasDirection ? EnemyRingStyle.Directional : EnemyRingStyle.NoDirection,
                        },
                        offset: getDragOffset(e),
                    });
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
            icon: '',
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
    isSelected?: boolean;
}

interface EnemyLabelProps extends RingProps {
    theme: EnemyTheme;
}

const EnemyLabel: React.FC<EnemyLabelProps> = ({ name, radius, theme, ...props }) => {
    if (radius < 32) {
        return null;
    }

    const fontSize = Math.max(10, Math.min(24, radius / 6));
    const strokeWidth = Math.max(1, fontSize / 8);

    return (
        <Text
            {...theme.text}
            text={name}
            width={radius * 2}
            height={radius * 2}
            offsetX={radius}
            offsetY={radius}
            fontSize={fontSize}
            strokeWidth={strokeWidth}
            align="center"
            verticalAlign="middle"
            fillAfterStrokeEnabled
            {...props}
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

const CircleRing: React.FC<RingProps> = ({ radius, color, isSelected, opacity, ...props }) => {
    const outerProps = getShapeProps(color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
    const innerRadius = getInnerRadius(radius);
    const outerRadius = getOuterRadius(radius, outerProps.strokeWidth);

    return (
        <>
            {isSelected && <Circle radius={radius} {...SELECTED_PROPS} />}

            <HideGroup opacity={opacity} {...props}>
                <Circle {...outerProps} radius={outerRadius} />
                <Circle {...innerProps} radius={innerRadius} />
            </HideGroup>
        </>
    );
};

interface DirectionalRingProps extends RingProps {
    rotation: number;
    groupRef: RefObject<Konva.Group>;
}

const DirectionalRing: React.FC<DirectionalRingProps> = ({
    radius,
    color,
    opacity,
    rotation,
    isSelected,
    groupRef,
    ...props
}) => {
    const outerProps = getShapeProps(color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
    const innerRadius = getInnerRadius(radius);
    const outerRadius = getOuterRadius(radius, outerProps.strokeWidth);
    const arrowScale = radius / 32;

    // Cache so overlapping shapes with opacity appear as one object.
    useKonvaCache(groupRef, [radius, color]);

    return (
        <>
            {isSelected && <Circle radius={radius + outerProps.strokeWidth / 2} {...SELECTED_PROPS} />}

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
            </HideGroup>
        </>
    );
};

const OmnidirectionalRing: React.FC<DirectionalRingProps> = ({
    radius,
    color,
    opacity,
    rotation,
    isSelected,
    groupRef,
    ...props
}) => {
    const outerProps = getShapeProps(color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
    const innerRadius = getInnerRadius(radius);
    const outerRadius = getOuterRadius(radius, outerProps.strokeWidth);
    const arrowScale = radius / 42;

    // Cache so overlapping shapes with opacity appear as one object.
    useKonvaCache(groupRef, [radius, color]);

    return (
        <>
            {isSelected && <Circle radius={radius} {...SELECTED_PROPS} />}

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
            </HideGroup>
        </>
    );
};

interface EnemyRendererProps extends RendererProps<EnemyObject> {
    radius: number;
    rotation: number;
    groupRef: RefObject<Konva.Group>;
    isDragging?: boolean;
}

function renderRing(
    object: EnemyObject,
    radius: number,
    rotation: number,
    groupRef: RefObject<Konva.Group>,
    showHighlight: boolean,
) {
    switch (object.ring) {
        case EnemyRingStyle.NoDirection:
            return (
                <CircleRing
                    radius={radius}
                    color={object.color}
                    opacity={object.opacity / 100}
                    isSelected={showHighlight}
                />
            );

        case EnemyRingStyle.Directional:
            return (
                <DirectionalRing
                    radius={radius}
                    rotation={rotation}
                    color={object.color}
                    opacity={object.opacity / 100}
                    isSelected={showHighlight}
                    groupRef={groupRef}
                />
            );

        case EnemyRingStyle.Omnidirectional:
            return (
                <OmnidirectionalRing
                    radius={radius}
                    rotation={rotation}
                    color={object.color}
                    opacity={object.opacity / 100}
                    isSelected={showHighlight}
                    groupRef={groupRef}
                />
            );
    }
}

const EnemyRenderer: React.FC<EnemyRendererProps> = ({ object, radius, rotation, groupRef, isDragging }) => {
    const showHighlight = useShowHighlight(object);
    const theme = useSceneTheme();

    return (
        <>
            <HideGroup>
                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={object.color} />}

                <EnemyLabel name={object.name} radius={radius} theme={theme.enemy} color={object.color} />
            </HideGroup>

            {renderRing(object, radius, rotation, groupRef, showHighlight)}
        </>
    );
};

const EnemyContainer: React.FC<RendererProps<EnemyObject>> = ({ object }) => {
    const groupRef = useRef<Konva.Group>(null);

    return (
        <RadiusObjectContainer
            object={object}
            allowRotate={object.rotation !== undefined}
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
    return <DetailsItem icon={object.icon} name={object.name || 'Enemy'} object={object} {...props} />;
};

registerListComponent<EnemyObject>(ObjectType.Enemy, EnemyDetails);

export const EnemyCircle = makeIcon('Enemy circle', 'enemy_circle.png', SIZE_SMALL, false);
export const EnemySmall = makeIcon('Small enemy', 'enemy_small.png', SIZE_SMALL);
export const EnemyMedium = makeIcon('Medium enemy', 'enemy_medium.png', SIZE_MEDIUM);
export const EnemyLarge = makeIcon('Large enemy', 'enemy_large.png', SIZE_LARGE);
export const EnemyHuge = makeIcon('Huge enemy', 'enemy_huge.png', SIZE_HUGE, false);
