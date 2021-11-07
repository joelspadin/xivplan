import { Position, SpinButton, Stack } from '@fluentui/react';
import { CircleConfig } from 'konva/lib/shapes/Circle';
import React, { useCallback, useMemo } from 'react';
import { Circle } from 'react-konva';
import icon from '../../assets/zone/meteor_tower.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { CompactSwatchColorPicker } from '../../CompactSwatchColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { COLOR_SWATCHES, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { ObjectType, TowerZone } from '../../scene';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { MIN_RADIUS } from '../bounds';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { useShowHighlight } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { getZoneStyle } from './style';

const DEFAULT_COLOR = '#bae3ff';
const DEFAULT_RADIUS = 40;
const DEFAULT_COUNT = 1;
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
        type: 'add',
        object: {
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
            return [{ radius: radius * 0.5 }];

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

interface TowerRendererProps extends RendererProps<TowerZone> {
    radius: number;
}

const TowerRenderer: React.FC<TowerRendererProps> = ({ object, radius }) => {
    const showHighlight = useShowHighlight(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, radius * 2),
        [object.color, object.opacity, radius],
    );

    const zones = useMemo(() => getCountZones(radius, object.count), [radius, object.count]);

    return (
        <>
            {showHighlight && <Circle radius={radius + style.strokeWidth / 2} {...SELECTED_PROPS} />}

            <Circle radius={radius} {...style} opacity={0.75} />
            {zones.map((props, i) => (
                <CountZone key={i} {...props} {...style} listening={false} />
            ))}
        </>
    );
};

const TowerContainer: React.FC<RendererProps<TowerZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object}>
            {({ radius }) => <TowerRenderer object={object} radius={radius} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<TowerZone>(ObjectType.Tower, LayerName.Ground, TowerContainer);

const TowerDetails: React.FC<ListComponentProps<TowerZone>> = ({ object }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Meteor/tower" object={object} />;
};

registerListComponent<TowerZone>(ObjectType.Tower, TowerDetails);

const TowerEditControl: React.FC<PropertiesControlProps<TowerZone>> = ({ object }) => {
    const [, dispatch] = useScene();

    const onRadiusChanged = useSpinChanged(
        (radius: number) => dispatch({ type: 'update', value: { ...object, radius } }),
        [dispatch, object],
    );

    const onColorChanged = useCallback(
        (color: string) => dispatch({ type: 'update', value: { ...object, color } }),
        [dispatch, object],
    );

    const onOpacityChanged = useCallback(
        (opacity: number) => {
            if (opacity !== object.opacity) {
                dispatch({ type: 'update', value: { ...object, opacity } });
            }
        },
        [dispatch, object],
    );

    const onCountChanged = useSpinChanged(
        (count: number) => dispatch({ type: 'update', value: { ...object, count } }),
        [dispatch, object],
    );

    const soakSuffix = object.count === 1 ? ' player' : ' players';

    return (
        <Stack>
            <CompactColorPicker label="Color" color={object.color} onChange={onColorChanged} />
            <CompactSwatchColorPicker color={object.color} swatches={COLOR_SWATCHES} onChange={onColorChanged} />

            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <MoveableObjectProperties object={object} />
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
                suffix={soakSuffix}
            />
        </Stack>
    );
};

registerPropertiesControl<TowerZone>(ObjectType.Tower, TowerEditControl);
