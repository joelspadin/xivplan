import { IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { Ring } from 'react-konva';
import icon from '../../assets/zone/donut.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/LayerList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { useCanvasCoord } from '../../render/coord';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { AOE_COLOR_SWATCHES, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY } from '../../render/SceneTheme';
import { DonutZone, ObjectType } from '../../scene';
import { updateListObject, useScene } from '../../SceneProvider';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { PrefabIcon } from '../PrefabIcon';
import { getZoneStyle } from './style';

const DEFAULT_OUTER_RADIUS = 150;
const DEFAULT_INNER_RADIUS = 50;

const MIN_RADIUS = 10;

export const ZoneDonut: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name="Donut AOE"
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Donut,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<DonutZone>(ObjectType.Donut, (object, position) => {
    return {
        type: 'zones',
        op: 'add',
        value: {
            type: ObjectType.Donut,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            innerRadius: DEFAULT_INNER_RADIUS,
            radius: DEFAULT_OUTER_RADIUS,
            ...object,
            ...position,
        },
    };
});

const DonutRenderer: React.FC<RendererProps<DonutZone>> = ({ object }) => {
    const center = useCanvasCoord(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, object.radius * 2),
        [object.color, object.opacity, object.radius],
    );

    return <Ring x={center.x} y={center.y} innerRadius={object.innerRadius} outerRadius={object.radius} {...style} />;
};

registerRenderer<DonutZone>(ObjectType.Donut, DonutRenderer);

const DonutDetails: React.FC<ListComponentProps<DonutZone>> = ({ layer, index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Donut" layer={layer} index={index} />;
};

registerListComponent<DonutZone>(ObjectType.Donut, DonutDetails);

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const DonutEditControl: React.FC<PropertiesControlProps<DonutZone>> = ({ object, layer, index }) => {
    const [, dispatch] = useScene();

    const onInnerRadiusChanged = useSpinChanged(
        (innerRadius: number) => updateListObject(dispatch, layer, index, { ...object, innerRadius }),
        [dispatch, object, layer, index],
    );

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
                    label="Inside radius"
                    labelPosition={Position.top}
                    value={object.innerRadius.toString()}
                    onChange={onInnerRadiusChanged}
                    min={MIN_RADIUS}
                    step={5}
                />
                <SpinButton
                    label="Outside radius"
                    labelPosition={Position.top}
                    value={object.radius.toString()}
                    onChange={onRadiusChanged}
                    min={MIN_RADIUS}
                    step={5}
                />
            </Stack>
        </Stack>
    );
};

registerPropertiesControl<DonutZone>([ObjectType.Donut], DonutEditControl);
