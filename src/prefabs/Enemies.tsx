import { IStackTokens, Position, SpinButton, Stack, Toggle } from '@fluentui/react';
import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';
import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { Arc, Circle, Group, Path, Text } from 'react-konva';
import { Portal } from 'react-konva-utils';
import { CompactColorPicker } from '../CompactColorPicker';
import { DeferredTextField } from '../DeferredTextField';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/LayerList';
import { PropertiesControlProps, registerPropertiesControl } from '../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../PanelDragProvider';
import { useCanvasCoord } from '../render/coord';
import { registerRenderer, RendererProps } from '../render/ObjectRenderer';
import { DEFAULT_ENEMY_COLOR, EnemyTheme, useSceneTheme } from '../render/SceneTheme';
import { EnemyObject, ObjectType } from '../scene';
import { updateListObject, useScene } from '../SceneProvider';
import { SpinButtonUnits } from '../SpinButtonUnits';
import { MoveableObjectProperties, useSpinChanged } from './CommonProperties';
import { PrefabIcon } from './PrefabIcon';

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
            type: ObjectType.Enemy,
            icon: '',
            name: '',
            color: DEFAULT_ENEMY_COLOR,
            radius: DEFAULT_SIZE,
            status: [],
            ...object,
            ...position,
        },
    };
});

interface RingProps {
    name: string;
    x: number;
    y: number;
    radius: number;
    color: string;
    theme: EnemyTheme;
}

const EnemyLabel: React.FunctionComponent<RingProps> = ({ name, x, y, radius, theme }) => {
    if (radius < 32) {
        return null;
    }

    const fontSize = Math.max(10, Math.min(24, radius / 6));
    const strokeWidth = Math.max(1, fontSize / 8);

    return (
        <Text
            {...theme.text}
            x={x}
            y={y}
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
        />
    );
};

function getInnerRadius(radius: number) {
    return Math.min(radius - 4, radius * INNER_RADIUS_RATIO);
}

function getShapeProps(
    theme: EnemyTheme,
    color: string,
    radius: number,
    strokeRatio: number,
    minStroke: number,
): ShapeConfig {
    const strokeWidth = Math.max(minStroke, radius * strokeRatio);
    const shadowBlur = Math.max(SHADOW_BLUR_MIN, radius * SHADOW_BLUR_RATIO);

    return {
        stroke: color,
        strokeWidth: strokeWidth,
        shadowColor: color,
        shadowBlur: shadowBlur,
        shadowOpacity: theme.ringShadowOpacity,
    };
}

const CircleRing: React.FunctionComponent<RingProps> = ({ x, y, radius, theme, color }) => {
    const innerRadius = getInnerRadius(radius);
    const outerProps = getShapeProps(theme, color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(theme, color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);

    return (
        <>
            <Group opacity={theme.opacity} x={x} y={y}>
                <Circle {...outerProps} radius={radius} />
                <Circle {...innerProps} radius={innerRadius} />
            </Group>
        </>
    );
};

interface DirectionalRingProps extends RingProps {
    rotation: number;
}

const DirectionalRing: React.FunctionComponent<DirectionalRingProps> = ({ x, y, radius, theme, color, rotation }) => {
    const innerRadius = getInnerRadius(radius);
    const outerProps = getShapeProps(theme, color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(theme, color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
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
                    fill={color}
                />
            </Group>
        </>
    );
};

const EnemyRenderer: React.FC<RendererProps<EnemyObject>> = ({ object }) => {
    const theme = useSceneTheme();
    const center = useCanvasCoord(object);

    return (
        <>
            <EnemyLabel
                {...center}
                name={object.name}
                radius={object.radius}
                theme={theme.enemy}
                color={object.color}
            />
            {/* Hitbox rings are uninteresting and should show behind everything else. */}
            <Portal selector=".background" enabled>
                {object.rotation === undefined ? (
                    <CircleRing
                        {...center}
                        name={object.name}
                        radius={object.radius}
                        theme={theme.enemy}
                        color={object.color}
                    />
                ) : (
                    <DirectionalRing
                        {...center}
                        name={object.name}
                        radius={object.radius}
                        theme={theme.enemy}
                        color={object.color}
                        rotation={object.rotation}
                    />
                )}
            </Portal>
        </>
    );
};

registerRenderer<EnemyObject>(ObjectType.Enemy, EnemyRenderer);

const EnemyDetails: React.FC<ListComponentProps<EnemyObject>> = ({ object, layer, index }) => {
    return <DetailsItem icon={object.icon} name={object.name} layer={layer} index={index} />;
};

registerListComponent<EnemyObject>(ObjectType.Enemy, EnemyDetails);

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const EnemyEditControl: React.FC<PropertiesControlProps<EnemyObject>> = ({ object, layer, index }) => {
    const [, dispatch] = useScene();

    const onNameChanged = React.useCallback(
        (newName?: string) => updateListObject(dispatch, layer, index, { ...object, name: newName ?? '' }),
        [dispatch, object, layer, index],
    );

    const onColorChanged = useCallback(
        (color: string) => updateListObject(dispatch, layer, index, { ...object, color }),
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
            <CompactColorPicker label="Color" color={object.color} onChange={onColorChanged} />
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
                <SpinButtonUnits
                    label="Rotation"
                    disabled={!isDirectional}
                    labelPosition={Position.top}
                    value={object.rotation?.toString()}
                    onChange={onRotationChanged}
                    step={15}
                    suffix="°"
                />
            </Stack>
        </Stack>
    );
};

registerPropertiesControl<EnemyObject>(ObjectType.Enemy, EnemyEditControl);

export const EnemyCircle = makeIcon('Generic enemy', 'enemy_circle.png', SIZE_SMALL, false);
export const EnemySmall = makeIcon('Small enemy', 'enemy_small.png', SIZE_SMALL);
export const EnemyMedium = makeIcon('Medium enemy', 'enemy_medium.png', SIZE_MEDIUM);
export const EnemyLarge = makeIcon('Large enemy', 'enemy_large.png', SIZE_LARGE);
export const EnemyHuge = makeIcon('Huge enemy', 'enemy_huge.png', SIZE_HUGE, false);
