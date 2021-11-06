import { IStackTokens, IStyle, mergeStyleSets, Position, SpinButton, Stack } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { Ring } from 'react-konva';
import icon from '../../assets/zone/donut.png';
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
import { DonutZone, ObjectType } from '../../scene';
import { useScene } from '../../SceneProvider';
import { MIN_RADIUS } from '../bounds';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { useShowHighlight } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { getZoneStyle } from './style';

const NAME = 'Donut';

const DEFAULT_OUTER_RADIUS = 150;
const DEFAULT_INNER_RADIUS = 50;

export const ZoneDonut: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
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
        type: 'add',
        object: {
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

interface DonutRendererProps extends RendererProps<DonutZone> {
    radius: number;
}

const DonutRenderer: React.FC<DonutRendererProps> = ({ object, index, radius }) => {
    const showHighlight = useShowHighlight(object, index);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, radius * 2),
        [object.color, object.opacity, radius],
    );

    return (
        <>
            {showHighlight && (
                <Ring
                    innerRadius={object.innerRadius - style.strokeWidth / 2}
                    outerRadius={radius + style.strokeWidth / 2}
                    {...SELECTED_PROPS}
                />
            )}
            <Ring innerRadius={object.innerRadius} outerRadius={radius} {...style} />
        </>
    );
};

const DonutContainer: React.FC<RendererProps<DonutZone>> = ({ object, index }) => {
    // TODO: add control point for inner radius
    return (
        <RadiusObjectContainer object={object} index={index}>
            {({ radius }) => <DonutRenderer object={object} index={index} radius={radius} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<DonutZone>(ObjectType.Donut, LayerName.Ground, DonutContainer);

const DonutDetails: React.FC<ListComponentProps<DonutZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name={NAME} index={index} />;
};

registerListComponent<DonutZone>(ObjectType.Donut, DonutDetails);

const classNames = mergeStyleSets({
    radiusRow: {
        marginRight: 32 + 10,
    } as IStyle,
});

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const DonutEditControl: React.FC<PropertiesControlProps<DonutZone>> = ({ object, index }) => {
    const [, dispatch] = useScene();

    const onInnerRadiusChanged = useSpinChanged(
        (innerRadius: number) => dispatch({ type: 'update', index, value: { ...object, innerRadius } }),
        [dispatch, object, index],
    );

    const onRadiusChanged = useSpinChanged(
        (radius: number) => dispatch({ type: 'update', index, value: { ...object, radius } }),
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

    return (
        <Stack>
            <CompactColorPicker label="Color" color={object.color} onChange={onColorChanged} />
            <CompactSwatchColorPicker color={object.color} swatches={COLOR_SWATCHES} onChange={onColorChanged} />

            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <MoveableObjectProperties object={object} index={index} />
            <Stack horizontal tokens={stackTokens} className={classNames.radiusRow}>
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
