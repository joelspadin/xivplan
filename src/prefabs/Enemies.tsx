import { IStackTokens, Position, SpinButton, Stack, Toggle } from '@fluentui/react';
import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';
import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { Arc, Circle, Group, Path, Text } from 'react-konva';
import { DeferredTextField } from '../DeferredTextField';
import { DetailsItem } from '../panel/LayerItem';
import { registerListComponent } from '../panel/LayerList';
import { registerPropertiesControl } from '../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../PanelDragProvider';
import { useCanvasCoord } from '../render/coord';
import { registerRenderer } from '../render/ObjectRenderer';
import { EnemyTheme, useSceneTheme } from '../render/SceneTheme';
import { EnemyObject, ObjectType } from '../scene';
import { SceneAction, updateListObject, useScene } from '../SceneProvider';
import { MoveableObjectProperties, useSpinChanged } from './CommonProperties';
import { PrefabIcon } from './PrefabIcon';

const DEFAULT_SIZE = 32;

const SIZE_SMALL = 16;
const SIZE_MEDIUM = 32;
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
        const iconUrl = new URL(`../assets/actor/${icon}`, import.meta.url).toString();

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
                            name,
                            radius,
                            rotation: hasDirection ? 0 : undefined,
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
        type: 'actors',
        op: 'add',
        value: {
            status: [],
            radius: DEFAULT_SIZE,
            ...object,
            ...position,
        } as EnemyObject,
    } as SceneAction;
});

interface RingProps {
    name: string;
    x: number;
    y: number;
    radius: number;
    theme: EnemyTheme;
}

const EnemyLabel: React.FunctionComponent<RingProps> = ({ name, x, y, radius, theme }) => {
    if (radius < 32) {
        return null;
    }

    const fontSize = Math.max(10, Math.min(24, radius / 6));
    const strokeWidth = Math.max(1, fontSize / 8);

    const textProps: Partial<Konva.TextConfig> = {
        ...theme.text,
        x,
        y,
        text: name,
        width: radius * 2,
        height: radius * 2,
        offsetX: radius,
        offsetY: radius,
        fontSize,
        strokeWidth,
        align: 'center',
        verticalAlign: 'middle',
    };

    return (
        <>
            <Text {...textProps} />
            <Text {...textProps} strokeEnabled={false} />
        </>
    );
};

function getInnerRadius(radius: number) {
    return Math.min(radius - 4, radius * INNER_RADIUS_RATIO);
}

function getShapeProps(theme: EnemyTheme, radius: number, strokeRatio: number, minStroke: number): ShapeConfig {
    const strokeWidth = Math.max(minStroke, radius * strokeRatio);
    const shadowBlur = Math.max(SHADOW_BLUR_MIN, radius * SHADOW_BLUR_RATIO);

    return {
        stroke: theme.ringColor,
        strokeWidth: strokeWidth,
        shadowColor: theme.ringColor,
        shadowBlur: shadowBlur,
        shadowOpacity: theme.ringShadowOpacity,
    };
}

const CircleRing: React.FunctionComponent<RingProps> = ({ name, x, y, radius, theme }) => {
    const innerRadius = getInnerRadius(radius);
    const outerProps = getShapeProps(theme, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(theme, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);

    return (
        <>
            <Group opacity={theme.opacity} x={x} y={y}>
                <Circle {...outerProps} radius={radius} />
                <Circle {...innerProps} radius={innerRadius} />
            </Group>
            <EnemyLabel x={x} y={y} name={name} radius={radius} theme={theme} />
        </>
    );
};

interface DirectionalRingProps extends RingProps {
    rotation: number;
}

const DirectionalRing: React.FunctionComponent<DirectionalRingProps> = ({ name, x, y, radius, theme, rotation }) => {
    const innerRadius = getInnerRadius(radius);
    const outerProps = getShapeProps(theme, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(theme, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
    const arrowScale = radius / 32;

    // Cache so overlapping shapes with opacity appear as one object.
    const groupRef = useRef<Konva.Group>(null);
    useEffect(() => {
        groupRef.current?.cache();
    }, [radius, theme, groupRef]);

    return (
        <>
            <Group opacity={theme.opacity} ref={groupRef} x={x} y={y} rotation={rotation}>
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
                    fill={theme.ringColor}
                />
            </Group>
            <EnemyLabel x={x} y={y} name={name} radius={radius} theme={theme} />
        </>
    );
};

registerRenderer<EnemyObject>(ObjectType.Enemy, ({ object }) => {
    const theme = useSceneTheme();
    const center = useCanvasCoord(object);

    if (object.rotation === undefined) {
        return <CircleRing {...center} name={object.name} radius={object.radius} theme={theme.enemy} />;
    } else {
        return (
            <DirectionalRing
                {...center}
                name={object.name}
                radius={object.radius}
                theme={theme.enemy}
                rotation={object.rotation}
            />
        );
    }
});

registerListComponent<EnemyObject>(ObjectType.Enemy, ({ object }) => {
    return <DetailsItem icon={object.icon} name={object.name} />;
});

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

registerPropertiesControl<EnemyObject>(ObjectType.Enemy, ({ object, layer, index }) => {
    const [, dispatch] = useScene();

    const onNameChanged = React.useCallback(
        (newName?: string) => updateListObject(dispatch, layer, index, { ...object, name: newName ?? '' }),
        [dispatch, object, layer, index],
    );
    const onRadiusChanged = useSpinChanged(
        (radius: number) => updateListObject(dispatch, layer, index, { ...object, radius }),
        [dispatch, object, layer, index],
    );
    const onDirectionalChanged = useCallback(
        (checked: boolean | undefined) => {
            const rotation = checked ? object.rotation ?? 0 : undefined;
            updateListObject(dispatch, layer, index, { ...object, rotation });
        },
        [dispatch, object, layer, index],
    );
    const onRotationChanged = useSpinChanged(
        (rotation: number) => updateListObject(dispatch, layer, index, { ...object, rotation: rotation % 360 }),
        [dispatch, object, layer, index],
    );

    const isDirectional = object.rotation !== undefined;

    return (
        <Stack>
            <DeferredTextField label="Name" value={object.name} onChange={onNameChanged} />
            <MoveableObjectProperties object={object} layer={layer} index={index} />
            <SpinButton
                label="Radius"
                labelPosition={Position.top}
                value={object.radius.toString()}
                onChange={onRadiusChanged}
                min={10}
                step={5}
            />
            <Stack horizontal verticalAlign="end" tokens={stackTokens}>
                <Toggle checked={isDirectional} onChange={(ev, checked) => onDirectionalChanged(checked)} />
                <SpinButton
                    label="Rotation (degrees)"
                    disabled={!isDirectional}
                    labelPosition={Position.top}
                    value={object.rotation?.toString()}
                    onChange={onRotationChanged}
                    step={15}
                />
            </Stack>
        </Stack>
    );
});

export const EnemyCircle = makeIcon('Generic enemy', 'enemy_circle.png', SIZE_SMALL, false);
export const EnemySmall = makeIcon('Small enemy', 'enemy_small.png', SIZE_SMALL);
export const EnemyMedium = makeIcon('Medium enemy', 'enemy_medium.png', SIZE_MEDIUM);
export const EnemyLarge = makeIcon('Large enemy', 'enemy_large.png', SIZE_LARGE);
export const EnemyHuge = makeIcon('Huge enemy', 'enemy_huge.png', SIZE_HUGE, false);
