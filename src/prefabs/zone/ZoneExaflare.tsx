import { IStackTokens, IStyle, mergeStyleSets, Position, SpinButton, Stack } from '@fluentui/react';
import { Vector2d } from 'konva/lib/types';
import React, { useCallback, useMemo } from 'react';
import { Circle, Group } from 'react-konva';
import icon from '../../assets/zone/exaflare.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { CompactSwatchColorPicker } from '../../CompactSwatchColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { COLOR_SWATCHES, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { ExaflareZone, ObjectType } from '../../scene';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { MIN_RADIUS } from '../bounds';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { useShowHighlight } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { ChevronTail } from './shapes';
import { getArrowStyle, getZoneStyle } from './style';

const NAME = 'Moving AOE';

const DEFAULT_RADIUS = 40;
const DEFAULT_LENGTH = 7;
const MIN_LENGTH = 2;

export const ZoneExaflare: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Exaflare,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<ExaflareZone>(ObjectType.Exaflare, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Exaflare,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            length: DEFAULT_LENGTH,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const ARROW_W_FRAC = 0.8;
const ARROW_H_FRAC = 0.5;

function getTrailPositions(radius: number, length: number): Vector2d[] {
    return Array.from({ length }).map((_, i) => ({
        x: 0,
        y: -radius * i,
    }));
}

function getDashSize(radius: number) {
    return (2 * Math.PI * radius) / 32;
}

interface ExaflareRendererProps extends RendererProps<ExaflareZone> {
    radius: number;
}

const ExaflareRenderer: React.FC<ExaflareRendererProps> = ({ object, index, radius }) => {
    const showHighlight = useShowHighlight(object, index);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, radius * 2),
        [object.color, object.opacity, radius],
    );
    const arrow = useMemo(() => getArrowStyle(object.color, object.opacity * 3), [object.color, object.opacity]);
    const trail = useMemo(() => getTrailPositions(radius, object.length), [radius, object.length]);
    const dashSize = getDashSize(radius);

    return (
        <>
            <Group rotation={object.rotation}>
                {trail.map((point, i) => (
                    <Circle
                        key={i}
                        listening={false}
                        radius={radius}
                        {...point}
                        {...style}
                        fillEnabled={false}
                        dash={[dashSize, dashSize]}
                        dashOffset={dashSize / 2}
                        opacity={0.5}
                    />
                ))}

                {showHighlight && <Circle radius={radius + style.strokeWidth / 2} {...SELECTED_PROPS} />}

                <Circle radius={radius} {...style} />
                <ChevronTail
                    y={-radius * ARROW_H_FRAC * 0.9}
                    width={radius * ARROW_W_FRAC}
                    height={radius * ARROW_H_FRAC}
                    {...arrow}
                />
            </Group>
        </>
    );
};

const ExaflareContainer: React.FC<RendererProps<ExaflareZone>> = ({ object, index }) => {
    // TODO: add control points for rotation and trail length
    return (
        <RadiusObjectContainer object={object} index={index}>
            {(radius) => <ExaflareRenderer object={object} index={index} radius={radius} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<ExaflareZone>(ObjectType.Exaflare, LayerName.Ground, ExaflareContainer);

const ExaflareDetails: React.FC<ListComponentProps<ExaflareZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name={NAME} index={index} />;
};

registerListComponent<ExaflareZone>(ObjectType.Exaflare, ExaflareDetails);

const classNames = mergeStyleSets({
    radiusRow: {
        marginRight: 32 + 10,
    } as IStyle,
});

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const ExaflareEditControl: React.FC<PropertiesControlProps<ExaflareZone>> = ({ object, index }) => {
    const [, dispatch] = useScene();

    const onRadiusChanged = useSpinChanged(
        (radius: number) => dispatch({ type: 'update', index, value: { ...object, radius } }),
        [dispatch, object, index],
    );

    const onLengthChanged = useSpinChanged(
        (length: number) => dispatch({ type: 'update', index, value: { ...object, length } }),
        [dispatch, object, index],
    );

    const onColorChanged = useCallback(
        (color: string) => dispatch({ type: 'update', index, value: { ...object, color } }),
        [dispatch, object, index],
    );

    const onOpacityChanged = useCallback(
        (opacity: number) => {
            if (opacity !== object.opacity) {
                dispatch({ type: 'update', index, value: { ...object, opacity } });
            }
        },
        [dispatch, object, index],
    );

    const onRotationChanged = useSpinChanged(
        (rotation: number) => dispatch({ type: 'update', index, value: { ...object, rotation: rotation % 360 } }),
        [dispatch, object, index],
    );

    return (
        <Stack>
            <CompactColorPicker label="Color" color={object.color} onChange={onColorChanged} />
            <CompactSwatchColorPicker color={object.color} swatches={COLOR_SWATCHES} onChange={onColorChanged} />

            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <MoveableObjectProperties object={object} index={index} />
            <Stack horizontal tokens={stackTokens} className={classNames.radiusRow}>
                <SpinButton
                    label="Radius"
                    labelPosition={Position.top}
                    value={object.radius.toString()}
                    onChange={onRadiusChanged}
                    min={MIN_RADIUS}
                    step={5}
                />
                <SpinButton
                    label="Length"
                    labelPosition={Position.top}
                    value={object.length.toString()}
                    onChange={onLengthChanged}
                    min={MIN_LENGTH}
                    step={1}
                />
            </Stack>
            <SpinButtonUnits
                label="Rotation"
                labelPosition={Position.top}
                value={object.rotation.toString()}
                onChange={onRotationChanged}
                step={15}
                suffix="°"
            />
        </Stack>
    );
};

registerPropertiesControl<ExaflareZone>(ObjectType.Exaflare, ExaflareEditControl);
