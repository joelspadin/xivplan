import { IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import { CircleConfig } from 'konva/lib/shapes/Circle';
import { RectConfig } from 'konva/lib/shapes/Rect';
import React, { useCallback, useMemo } from 'react';
import { Group, Rect } from 'react-konva';
import icon from '../../assets/zone/starburst.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/LayerItem';
import { ListComponentProps, registerListComponent } from '../../panel/LayerList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { useCanvasCoord } from '../../render/coord';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { AOE_COLOR_SWATCHES, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY } from '../../render/SceneTheme';
import { ObjectType, StarburstZone } from '../../scene';
import { updateListObject, useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { PrefabIcon } from '../PrefabIcon';
import { getZoneStyle } from './style';

const DEFAULT_RADIUS = 250;
const DEFAULT_SPOKE_WIDTH = 40;
const DEFAULT_SPOKE_COUNT = 8;
const MIN_RADIUS = 10;
const MIN_SPOKE_WIDTH = 10;
const MIN_SPOKE_COUNT = 3;
const MAX_SPOKE_COUNT = 16;

export const ZoneStarburst: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Starburst AOE"
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Starburst,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<StarburstZone>(ObjectType.Starburst, (object, position) => {
    return {
        type: 'zones',
        op: 'add',
        value: {
            type: ObjectType.Starburst,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            spokes: DEFAULT_SPOKE_COUNT,
            spokeWidth: DEFAULT_SPOKE_WIDTH,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

interface StarburstConfig extends CircleConfig {
    radius: number;
    spokes: number;
    spokeWidth: number;
}

function getOddRotations(spokes: number) {
    return Array.from({ length: spokes }).map((_, i) => (i / spokes) * 360);
}

const StarburstOdd: React.FC<StarburstConfig> = ({ x, y, rotation, radius, spokes, spokeWidth, ...props }) => {
    const items = useMemo(() => getOddRotations(spokes), [spokes]);

    const rect: RectConfig = {
        offsetX: spokeWidth / 2,
        width: spokeWidth,
        height: -radius,
        ...props,
    };

    return (
        <Group x={x} y={y} rotation={rotation}>
            {items.map((r, i) => (
                <Rect key={i} rotation={r} {...rect} />
            ))}
        </Group>
    );
};

function getEvenRotations(spokes: number) {
    const items = spokes / 2;
    return Array.from({ length: items }).map((_, i) => (i / items) * 180);
}

const StarburstEven: React.FC<StarburstConfig> = ({ x, y, rotation, radius, spokes, spokeWidth, ...props }) => {
    const items = useMemo(() => getEvenRotations(spokes), [spokes]);

    const rect: RectConfig = {
        offsetX: spokeWidth / 2,
        offsetY: radius,
        width: spokeWidth,
        height: radius * 2,
        ...props,
    };

    return (
        <Group x={x} y={y} rotation={rotation}>
            {items.map((r, i) => (
                <Rect key={i} rotation={r} {...rect} />
            ))}
        </Group>
    );
};

const StarburstRenderer: React.FC<RendererProps<StarburstZone>> = ({ object }) => {
    const center = useCanvasCoord(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, object.spokeWidth * 2),
        [object.color, object.opacity, object.spokeWidth],
    );

    const config: StarburstConfig = {
        ...center,
        ...style,
        radius: object.radius,
        spokes: object.spokes,
        spokeWidth: object.spokeWidth,
        rotation: object.rotation,
    };

    if (object.spokes % 2 === 0) {
        return <StarburstEven {...config} />;
    } else {
        return <StarburstOdd {...config} />;
    }
};

registerRenderer<StarburstZone>(ObjectType.Starburst, StarburstRenderer);

const StarburstDetails: React.FC<ListComponentProps<StarburstZone>> = () => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Starburst" />;
};

registerListComponent<StarburstZone>(ObjectType.Starburst, StarburstDetails);

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const StarburstEditControl: React.FC<PropertiesControlProps<StarburstZone>> = ({ object, layer, index }) => {
    const [, dispatch] = useScene();

    const onRadiusChanged = useSpinChanged(
        (radius: number) => updateListObject(dispatch, layer, index, { ...object, radius }),
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

    const onSpokesChanged = useSpinChanged(
        (spokes: number) => updateListObject(dispatch, layer, index, { ...object, spokes }),
        [dispatch, object, layer, index],
    );

    const onSpokeWidthChanged = useSpinChanged(
        (spokeWidth: number) => updateListObject(dispatch, layer, index, { ...object, spokeWidth }),
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
                    label="Spoke width"
                    labelPosition={Position.top}
                    value={object.spokeWidth.toString()}
                    onChange={onSpokeWidthChanged}
                    min={MIN_SPOKE_WIDTH}
                    step={5}
                />
            </Stack>
            <Stack horizontal tokens={stackTokens}>
                <SpinButtonUnits
                    label="Rotation"
                    labelPosition={Position.top}
                    value={object.rotation.toString()}
                    onChange={onRotationChanged}
                    step={15}
                    suffix="°"
                />
                <SpinButton
                    label="Spokes"
                    labelPosition={Position.top}
                    value={object.spokes.toString()}
                    onChange={onSpokesChanged}
                    min={MIN_SPOKE_COUNT}
                    max={MAX_SPOKE_COUNT}
                    step={1}
                />
            </Stack>
        </Stack>
    );
};

registerPropertiesControl<StarburstZone>(ObjectType.Starburst, StarburstEditControl);
