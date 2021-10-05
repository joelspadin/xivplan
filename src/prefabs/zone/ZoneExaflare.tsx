import { IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { Circle, Group } from 'react-konva';
import icon from '../../assets/zone/exaflare.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/LayerList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { useCanvasCoord } from '../../render/coord';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { AOE_COLOR_SWATCHES, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY } from '../../render/SceneTheme';
import { ExaflareZone, ObjectType, Point } from '../../scene';
import { updateListObject, useScene } from '../../SceneProvider';
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
        type: 'zones',
        op: 'add',
        value: {
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

function getTrailPositions(radius: number, length: number): Point[] {
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
    );
};

registerRenderer<ExaflareZone>(ObjectType.Exaflare, ExaflareRenderer);

const ExaflareDetails: React.FC<ListComponentProps<ExaflareZone>> = ({ layer, index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Exaflare" layer={layer} index={index} />;
};

registerListComponent<ExaflareZone>(ObjectType.Exaflare, ExaflareDetails);

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const ExaflareEditControl: React.FC<PropertiesControlProps<ExaflareZone>> = ({ object, layer, index }) => {
    const [, dispatch] = useScene();

    const onRadiusChanged = useSpinChanged(
        (radius: number) => updateListObject(dispatch, layer, index, { ...object, radius }),
        [dispatch, object, layer, index],
    );

    const onLengthChanged = useSpinChanged(
        (length: number) => updateListObject(dispatch, layer, index, { ...object, length }),
        [dispatch, object, layer, index],
    );

    const onColorChanged = useCallback(
        (color: string) => updateListObject(dispatch, layer, index, { ...object, color }),
        [dispatch, object, layer, index],
    );

    const onOpacityChanged = useCallback(
        (opacity: number) => updateListObject(dispatch, layer, index, { ...object, opacity }),
        [dispatch, object, layer, index],
    );

    const onRotationChanged = useSpinChanged(
        (rotation: number) => updateListObject(dispatch, layer, index, { ...object, rotation: rotation % 360 }),
        [dispatch, object, layer, index],
    );

    return (
        <Stack>
            <CompactColorPicker
                label="Color"
                color={object.color}
                swatches={AOE_COLOR_SWATCHES}
                onChange={onColorChanged}
            />
            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <MoveableObjectProperties object={object} layer={layer} index={index} />
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
