import { IChoiceGroupOption, IIconStyles, IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import Konva from 'konva';
import { ShapeConfig } from 'konva/lib/Shape';
import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { Arc, Circle, Group, Path, Text } from 'react-konva';
import { CompactChoiceGroup } from '../CompactChoiceGroup';
import { CompactColorPicker } from '../CompactColorPicker';
import { CompactSwatchColorPicker } from '../CompactSwatchColorPicker';
import { DeferredTextField } from '../DeferredTextField';
import { DetailsItem } from '../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../PanelDragProvider';
import { LayerName } from '../render/layers';
import { registerRenderer, RendererProps } from '../render/ObjectRenderer';
import { COLOR_SWATCHES, DEFAULT_ENEMY_COLOR, EnemyTheme, SELECTED_PROPS, useSceneTheme } from '../render/SceneTheme';
import { EnemyObject, ObjectType } from '../scene';
import { useScene } from '../SceneProvider';
import { SpinButtonUnits } from '../SpinButtonUnits';
import { MoveableObjectProperties, useSpinChanged } from './CommonProperties';
import { useShowHighlight } from './highlight';
import { PrefabIcon } from './PrefabIcon';
import { RadiusObjectContainer } from './RadiusObjectContainer';

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
        type: 'add',
        object: {
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

interface RingProps extends ShapeConfig {
    name?: string;
    radius: number;
    color: string;
    theme: EnemyTheme;
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

function getShapeProps(theme: EnemyTheme, color: string, radius: number, strokeRatio: number, minStroke: number) {
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

const CircleRing: React.FC<RingProps> = ({ radius, theme, color, isSelected, ...props }) => {
    const innerRadius = getInnerRadius(radius);
    const outerProps = getShapeProps(theme, color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(theme, color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);

    return (
        <>
            {isSelected && <Circle radius={radius + outerProps.strokeWidth / 2} {...SELECTED_PROPS} />}

            <Group opacity={theme.opacity} {...props}>
                <Circle {...outerProps} radius={radius} />
                <Circle {...innerProps} radius={innerRadius} />
            </Group>
        </>
    );
};

interface DirectionalRingProps extends RingProps {
    rotation: number;
}

const DirectionalRing: React.FC<DirectionalRingProps> = ({ radius, theme, color, rotation, isSelected, ...props }) => {
    const innerRadius = getInnerRadius(radius);
    const outerProps = getShapeProps(theme, color, radius, OUTER_STROKE_RATIO, OUTER_STROKE_MIN);
    const innerProps = getShapeProps(theme, color, radius, INNER_STROKE_RATIO, INNER_STROKE_MIN);
    const arrowScale = radius / 32;

    // Cache so overlapping shapes with opacity appear as one object.
    const groupRef = useRef<Konva.Group>(null);
    useEffect(() => {
        groupRef.current?.cache();
    }, [radius, theme, color, groupRef]);

    return (
        <>
            {isSelected && <Circle radius={radius + outerProps.strokeWidth / 2} {...SELECTED_PROPS} />}

            <Group opacity={theme.opacity} ref={groupRef} rotation={rotation} {...props}>
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
}

const EnemyRenderer: React.FC<EnemyRendererProps> = ({ object, index, radius }) => {
    const showHighlight = useShowHighlight(object, index);
    const theme = useSceneTheme();

    return (
        <>
            <EnemyLabel name={object.name} radius={radius} theme={theme.enemy} color={object.color} />

            {object.rotation === undefined ? (
                <CircleRing radius={radius} theme={theme.enemy} color={object.color} isSelected={showHighlight} />
            ) : (
                <DirectionalRing
                    radius={radius}
                    theme={theme.enemy}
                    color={object.color}
                    rotation={object.rotation}
                    isSelected={showHighlight}
                />
            )}
        </>
    );
};

const EnemyContainer: React.FC<RendererProps<EnemyObject>> = ({ object, index }) => {
    // TODO: add control point for rotation
    return (
        <RadiusObjectContainer object={object} index={index}>
            {(radius) => <EnemyRenderer object={object} index={index} radius={radius} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<EnemyObject>(ObjectType.Enemy, LayerName.Ground, EnemyContainer);

const EnemyDetails: React.FC<ListComponentProps<EnemyObject>> = ({ object, index }) => {
    return <DetailsItem icon={object.icon} name={object.name} index={index} />;
};

registerListComponent<EnemyObject>(ObjectType.Enemy, EnemyDetails);

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const rotateIconStyle: IIconStyles = {
    root: {
        transform: 'rotate(135deg)',
    },
};

enum RingStyle {
    Directional = 'directional',
    Omnidirectional = 'omnidirectional',
}

const directionalOptions: IChoiceGroupOption[] = [
    // TODO: use CircleShape whenever icon font gets fixed.
    { key: RingStyle.Omnidirectional, text: 'Omnidirectional', iconProps: { iconName: 'CircleRing' } },
    {
        key: RingStyle.Directional,
        text: 'Directional',
        iconProps: { iconName: 'ThreeQuarterCircle', styles: rotateIconStyle },
    },
];

const EnemyEditControl: React.FC<PropertiesControlProps<EnemyObject>> = ({ object, index }) => {
    const [, dispatch] = useScene();

    const onNameChanged = React.useCallback(
        (newName?: string) => dispatch({ type: 'update', index, value: { ...object, name: newName ?? '' } }),
        [dispatch, object, index],
    );

    const onColorChanged = useCallback(
        (color: string) => dispatch({ type: 'update', index, value: { ...object, color } }),
        [dispatch, object, index],
    );

    const onRadiusChanged = useSpinChanged(
        (radius: number) => dispatch({ type: 'update', index, value: { ...object, radius } }),
        [dispatch, object, index],
    );

    const onDirectionalChanged = useCallback(
        (option: RingStyle) => {
            const rotation = option === RingStyle.Directional ? 0 : undefined;
            dispatch({ type: 'update', index, value: { ...object, rotation } });
        },
        [dispatch, object, index],
    );

    const onRotationChanged = useSpinChanged(
        (rotation: number) => dispatch({ type: 'update', index, value: { ...object, rotation: rotation % 360 } }),
        [dispatch, object, index],
    );

    const isDirectional = object.rotation !== undefined;
    const directionalKey = isDirectional ? RingStyle.Directional : RingStyle.Omnidirectional;

    return (
        <Stack>
            <DeferredTextField label="Name" value={object.name} onChange={onNameChanged} />
            <CompactColorPicker label="Color" color={object.color} onChange={onColorChanged} />
            <CompactSwatchColorPicker color={object.color} swatches={COLOR_SWATCHES} onChange={onColorChanged} />
            <MoveableObjectProperties object={object} index={index} />
            <SpinButton
                label="Radius"
                labelPosition={Position.top}
                value={object.radius.toString()}
                onChange={onRadiusChanged}
                min={10}
                step={5}
            />
            <Stack horizontal verticalAlign="end" tokens={stackTokens}>
                <CompactChoiceGroup
                    label="Style"
                    options={directionalOptions}
                    selectedKey={directionalKey}
                    onChange={(e, option) => onDirectionalChanged(option?.key as RingStyle)}
                />
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
