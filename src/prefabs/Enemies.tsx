import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';
import * as React from 'react';
import { RefObject, useEffect, useRef } from 'react';
import { Arc, Circle, Group, Path, Text } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../DropHandler';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../render/ObjectRegistry';
import {
    CENTER_DOT_RADIUS,
    DEFAULT_ENEMY_COLOR,
    DEFAULT_ENEMY_OPACITY,
    SELECTED_PROPS,
    useSceneTheme,
} from '../render/SceneTheme';
import { LayerName } from '../render/layers';
import { EnemyObject, ObjectType } from '../scene';
import { usePanelDrag } from '../usePanelDrag';
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
    // eslint-disable-next-line react/display-name
    return () => {
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
                            omniDirection: !hasDirection,
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
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

const EnemyLabel: React.FC<RingProps> = ({ name, radius, theme, ...props }) => {
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
    const innerRadius = getInnerRadius(radius);
    const outerProps = getShapeProps(color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);

    return (
        <>
            {isSelected && <Circle radius={radius + outerProps.strokeWidth / 2} {...SELECTED_PROPS} />}

            <Group opacity={opacity} {...props}>
                <Circle {...outerProps} radius={radius} />
                <Circle {...innerProps} radius={innerRadius} />
            </Group>
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
    const innerRadius = getInnerRadius(radius);
    const outerProps = getShapeProps(color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
    const arrowScale = radius / 32;

    // Cache so overlapping shapes with opacity appear as one object.
    useEffect(() => {
        groupRef.current?.cache();
    }, [radius, color, groupRef]);

    return (
        <>
            {isSelected && <Circle radius={radius + outerProps.strokeWidth / 2} {...SELECTED_PROPS} />}

            <Group opacity={opacity} ref={groupRef} rotation={rotation} {...props}>
                <Circle radius={radius} fill="transparent" />
                <Arc
                    {...outerProps}
                    rotation={RING_ROTATION}
                    angle={RING_ANGLE}
                    innerRadius={radius}
                    outerRadius={radius}
                />
                <Arc
                    {...innerProps}
                    rotation={RING_ROTATION}
                    angle={RING_ANGLE}
                    innerRadius={innerRadius}
                    outerRadius={innerRadius}
                />
                <Path
                    data="M0-42c-2 2-4 7-4 10c4 0 4 0 8 0c0-3-2-8-4-10"
                    scaleX={arrowScale}
                    scaleY={arrowScale}
                    strokeEnabled={false}
                    fill={color}
                />
            </Group>
        </>
    );
};

interface EnemyRendererProps extends RendererProps<EnemyObject> {
    radius: number;
    rotation: number;
    groupRef: RefObject<Konva.Group>;
    isDragging?: boolean;
}

const EnemyRenderer: React.FC<EnemyRendererProps> = ({ object, radius, rotation, groupRef, isDragging }) => {
    const showHighlight = useShowHighlight(object);
    const theme = useSceneTheme();

    return (
        <>
            {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={object.color} />}

            <EnemyLabel name={object.name} radius={radius} theme={theme.enemy} color={object.color} />

            {object.omniDirection ? (
                <CircleRing
                    radius={radius}
                    color={object.color}
                    opacity={object.opacity / 100}
                    isSelected={showHighlight}
                />
            ) : (
                <DirectionalRing
                    radius={radius}
                    rotation={rotation}
                    color={object.color}
                    opacity={object.opacity / 100}
                    isSelected={showHighlight}
                    groupRef={groupRef}
                />
            )}
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

const EnemyDetails: React.FC<ListComponentProps<EnemyObject>> = ({ object, isNested }) => {
    return <DetailsItem icon={object.icon} name={object.name || 'Enemy'} object={object} isNested={isNested} />;
};

registerListComponent<EnemyObject>(ObjectType.Enemy, EnemyDetails);

export const EnemyCircle = makeIcon('Generic enemy', 'enemy_circle.png', SIZE_SMALL, false);
export const EnemySmall = makeIcon('Small enemy', 'enemy_small.png', SIZE_SMALL);
export const EnemyMedium = makeIcon('Medium enemy', 'enemy_medium.png', SIZE_MEDIUM);
export const EnemyLarge = makeIcon('Large enemy', 'enemy_large.png', SIZE_LARGE);
export const EnemyHuge = makeIcon('Huge enemy', 'enemy_huge.png', SIZE_HUGE, false);
