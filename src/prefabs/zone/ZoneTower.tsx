import { Position, SpinButton, Stack } from '@fluentui/react';
import { CircleConfig } from 'konva/lib/shapes/Circle';
import React, { useCallback, useMemo } from 'react';
import { Circle, Group } from 'react-konva';
import icon from '../../assets/zone/meteor_tower.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/LayerList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { useCanvasCoord } from '../../render/coord';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { AOE_COLOR_SWATCHES, DEFAULT_AOE_OPACITY } from '../../render/SceneTheme';
import { ObjectType, TowerZone } from '../../scene';
import { updateListObject, useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { PrefabIcon } from '../PrefabIcon';
import { getZoneStyle } from './style';

const DEFAULT_COLOR = '#bae3ff';
const DEFAULT_RADIUS = 40;
const DEFAULT_COUNT = 1;
const MIN_RADIUS = 10;
const MIN_COUNT = 1;
const MAX_COUNT = 4;

export const ZoneTower: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name="Meteor/tower"
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Tower,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<TowerZone>(ObjectType.Tower, (object, position) => {
    return {
        type: 'zones',
        op: 'add',
        value: {
            type: ObjectType.Tower,
            color: DEFAULT_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            count: DEFAULT_COUNT,
            ...object,
            ...position,
        },
    };
});

const CountZone: React.FC<CircleConfig> = (props) => {
    const offset = (props.radius ?? 0) * 0.15;
    return (
        <>
            <Circle {...props} />
            <Circle {...props} offsetY={offset} fillEnabled={false} opacity={0.5} />
            <Circle {...props} offsetY={offset * 2} fillEnabled={false} opacity={0.4} />
            <Circle {...props} offsetY={offset * 3} fillEnabled={false} opacity={0.3} />
            <Circle {...props} offsetY={offset * 4} fillEnabled={false} opacity={0.2} />
        </>
    );
};

function getCountZones(radius: number, count: number): Partial<CircleConfig>[] {
    switch (count) {
        case 1:
            return [{ radius: radius * 0.75 }];

        case 2: {
            const r = radius * 0.9;

            return Array.from({ length: count }).map((_, i) => ({
                x: (-0.5 + i) * r,
                radius: r / count,
            }));
        }

        case 3: {
            const r = radius * 0.9;
            const scale = 2 / 3;

            return Array.from({ length: count }).map((_, i) => ({
                x: scale * (i - 1) * r,
                radius: r / count,
            }));
        }

        case 4:
            return Array.from({ length: count }).map((_, i) => {
                const angle = (Math.PI / 4) * (i * 2 - 1);
                const r = radius * 0.5;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;

                return {
                    x,
                    y,
                    radius: radius * 0.35,
                };
            });
    }

    return [];
}

const TowerRenderer: React.FC<RendererProps<TowerZone>> = ({ object }) => {
    const center = useCanvasCoord(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, object.radius * 2),
        [object.color, object.opacity, object.radius],
    );

    const zones = useMemo(() => getCountZones(object.radius, object.count), [object.radius, object.count]);

    return (
        <Group x={center.x} y={center.y}>
            <Circle radius={object.radius} {...style} opacity={0.75} />
            {zones.map((props, i) => (
                <CountZone key={i} {...props} {...style} />
            ))}
        </Group>
    );
};

registerRenderer<TowerZone>(ObjectType.Tower, TowerRenderer);

const TowerDetails: React.FC<ListComponentProps<TowerZone>> = ({ layer, index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Meteor/tower" layer={layer} index={index} />;
};

registerListComponent<TowerZone>(ObjectType.Tower, TowerDetails);

const TowerEditControl: React.FC<PropertiesControlProps<TowerZone>> = ({ object, layer, index }) => {
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

    const onCountChanged = useSpinChanged(
        (count: number) => updateListObject(dispatch, layer, index, { ...object, count }),
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
            <SpinButton
                label="Radius"
                labelPosition={Position.top}
                value={object.radius.toString()}
                onChange={onRadiusChanged}
                min={MIN_RADIUS}
                step={5}
            />
            <SpinButtonUnits
                label="Soak count"
                labelPosition={Position.top}
                value={object.count.toString()}
                onChange={onCountChanged}
                min={MIN_COUNT}
                max={MAX_COUNT}
                step={1}
                suffix=" player(s)"
            />
        </Stack>
    );
};

registerPropertiesControl<TowerZone>(
    ObjectType.Tower,

    TowerEditControl,
);
