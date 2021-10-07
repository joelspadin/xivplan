import { IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import { Vector2d } from 'konva/lib/types';
import React, { useCallback, useMemo } from 'react';
import { Circle, Group } from 'react-konva';
import icon from '../../assets/zone/exaflare.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { useCanvasCoord } from '../../render/coord';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { GroundPortal } from '../../render/Portals';
import { COLOR_SWATCHES, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY } from '../../render/SceneTheme';
import { ExaflareZone, ObjectType } from '../../scene';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { PrefabIcon } from '../PrefabIcon';
import { ChevronTail } from './shapes';
import { getArrowStyle, getZoneStyle } from './style';

const DEFAULT_RADIUS = 40;
const DEFAULT_LENGTH = 7;
const MIN_RADIUS = 10;
const MIN_LENGTH = 2;

export const ZoneExaflare: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name="Moving AOE"
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

const ExaflareRenderer: React.FC<RendererProps<ExaflareZone>> = ({ object }) => {
    const center = useCanvasCoord(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, object.radius * 2),
        [object.color, object.opacity, object.radius],
    );
    const arrow = useMemo(() => getArrowStyle(object.color, object.opacity * 3), [object.color, object.opacity]);
    const trail = useMemo(() => getTrailPositions(object.radius, object.length), [object.radius, object.length]);
    const dashSize = getDashSize(object.radius);

    return (
        <GroundPortal>
            <Group x={center.x} y={center.y} rotation={object.rotation}>
                {trail.map((point, i) => (
                    <Circle
                        key={i}
                        radius={object.radius}
                        {...point}
                        {...style}
                        fillEnabled={false}
                        dash={[dashSize, dashSize]}
                        dashOffset={dashSize / 2}
                        opacity={0.5}
                    />
                ))}

                <Circle radius={object.radius} {...style} />
                <ChevronTail
                    y={-object.radius * ARROW_H_FRAC * 0.9}
                    width={object.radius * ARROW_W_FRAC}
                    height={object.radius * ARROW_H_FRAC}
                    {...arrow}
                />
            </Group>
        </GroundPortal>
    );
};

registerRenderer<ExaflareZone>(ObjectType.Exaflare, ExaflareRenderer);

const ExaflareDetails: React.FC<ListComponentProps<ExaflareZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Exaflare" index={index} />;
};

registerListComponent<ExaflareZone>(ObjectType.Exaflare, ExaflareDetails);

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
        (opacity: number) => dispatch({ type: 'update', index, value: { ...object, opacity } }),
        [dispatch, object, index],
    );

    const onRotationChanged = useSpinChanged(
        (rotation: number) => dispatch({ type: 'update', index, value: { ...object, rotation: rotation % 360 } }),
        [dispatch, object, index],
    );

    return (
        <Stack>
            <CompactColorPicker
                label="Color"
                color={object.color}
                swatches={COLOR_SWATCHES}
                onChange={onColorChanged}
            />
            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <MoveableObjectProperties object={object} index={index} />
            <Stack horizontal tokens={stackTokens}>
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
