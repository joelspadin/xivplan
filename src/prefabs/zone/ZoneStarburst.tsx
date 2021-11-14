import { IStackTokens, IStyle, mergeStyleSets, Position, SpinButton, Stack } from '@fluentui/react';
import { CircleConfig } from 'konva/lib/shapes/Circle';
import React, { useCallback, useMemo } from 'react';
import { Group, Rect } from 'react-konva';
import icon from '../../assets/zone/starburst.png';
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
import { ObjectType, StarburstZone } from '../../scene';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { MIN_RADIUS } from '../bounds';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { useShowHighlight } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { StarburstControlContainer } from './StarburstContainer';
import { getZoneStyle } from './style';

const NAME = 'Starburst';

const DEFAULT_RADIUS = 250;
const DEFAULT_SPOKE_WIDTH = 40;
const DEFAULT_SPOKE_COUNT = 8;
const MIN_SPOKE_WIDTH = 10;
const MIN_SPOKE_COUNT = 3;
const MAX_SPOKE_COUNT = 16;

export const ZoneStarburst: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name={NAME}
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
        type: 'add',
        object: {
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
    showHighlight: boolean;
}

function getOddRotations(spokes: number) {
    return Array.from({ length: spokes }).map((_, i) => 180 + (i / spokes) * 360);
}

const StarburstOdd: React.FC<StarburstConfig> = ({ rotation, radius, spokes, spokeWidth, showHighlight, ...props }) => {
    const items = useMemo(() => getOddRotations(spokes), [spokes]);

    const rect = {
        offsetX: spokeWidth / 2,
        width: spokeWidth,
        height: radius,
        ...props,
    };

    const strokeWidth = props.strokeWidth ?? 0;
    const highlightWidth = rect.width + strokeWidth;
    const highlightHeight = rect.height + strokeWidth;

    return (
        <Group rotation={rotation}>
            {showHighlight &&
                items.map((r, i) => (
                    <Rect
                        key={i}
                        rotation={r}
                        offsetX={highlightWidth / 2}
                        width={highlightWidth}
                        height={highlightHeight}
                        {...SELECTED_PROPS}
                    />
                ))}

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

const StarburstEven: React.FC<StarburstConfig> = ({
    rotation,
    radius,
    spokes,
    spokeWidth,
    showHighlight,
    ...props
}) => {
    const items = useMemo(() => getEvenRotations(spokes), [spokes]);

    const rect = {
        offsetX: spokeWidth / 2,
        offsetY: radius,
        width: spokeWidth,
        height: radius * 2,
        ...props,
    };

    const strokeWidth = props.strokeWidth ?? 0;
    const highlightWidth = rect.width + strokeWidth;
    const highlightHeight = rect.height + strokeWidth;

    return (
        <Group rotation={rotation}>
            {showHighlight &&
                items.map((r, i) => (
                    <Rect
                        key={i}
                        rotation={r}
                        offsetX={highlightWidth / 2}
                        offsetY={highlightHeight / 2}
                        width={highlightWidth}
                        height={highlightHeight}
                        {...SELECTED_PROPS}
                    />
                ))}

            {items.map((r, i) => (
                <Rect key={i} rotation={r} {...rect} />
            ))}
        </Group>
    );
};

interface StarburstRendererProps extends RendererProps<StarburstZone> {
    radius: number;
    rotation: number;
    spokeWidth: number;
}

const StarburstRenderer: React.FC<StarburstRendererProps> = ({ object, radius, rotation, spokeWidth }) => {
    const showSelected = useShowHighlight(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, object.spokeWidth * 2),
        [object.color, object.opacity, object.spokeWidth],
    );

    const config: StarburstConfig = {
        ...style,
        radius,
        rotation,
        spokeWidth,
        spokes: object.spokes,
        showHighlight: showSelected,
    };

    return object.spokes % 2 === 0 ? <StarburstEven {...config} /> : <StarburstOdd {...config} />;
};

const StarburstContainer: React.FC<RendererProps<StarburstZone>> = ({ object }) => {
    // TODO: add control point for spoke width
    return (
        <StarburstControlContainer object={object} minSpokeWidth={MIN_SPOKE_WIDTH}>
            {({ radius, rotation, spokeWidth }) => (
                <StarburstRenderer object={object} radius={radius} rotation={rotation} spokeWidth={spokeWidth} />
            )}
        </StarburstControlContainer>
    );
};

registerRenderer<StarburstZone>(ObjectType.Starburst, LayerName.Ground, StarburstContainer);

const StarburstDetails: React.FC<ListComponentProps<StarburstZone>> = ({ object }) => {
    return <DetailsItem icon={icon} name={NAME} object={object} color={object.color} />;
};

registerListComponent<StarburstZone>(ObjectType.Starburst, StarburstDetails);

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const classNames = mergeStyleSets({
    sizeRow: {
        marginRight: 32 + 10,
    } as IStyle,
});

const StarburstEditControl: React.FC<PropertiesControlProps<StarburstZone>> = ({ object }) => {
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

    const onRotationChanged = useSpinChanged(
        (rotation: number) => dispatch({ type: 'update', value: { ...object, rotation: rotation % 360 } }),
        [dispatch, object],
    );

    const onSpokesChanged = useSpinChanged(
        (spokes: number) => dispatch({ type: 'update', value: { ...object, spokes } }),
        [dispatch, object],
    );

    const onSpokeWidthChanged = useSpinChanged(
        (spokeWidth: number) => dispatch({ type: 'update', value: { ...object, spokeWidth } }),
        [dispatch, object],
    );

    return (
        <Stack>
            <CompactColorPicker label="Color" color={object.color} onChange={onColorChanged} />
            <CompactSwatchColorPicker color={object.color} swatches={COLOR_SWATCHES} onChange={onColorChanged} />

            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <MoveableObjectProperties object={object} />
            <Stack horizontal tokens={stackTokens} className={classNames.sizeRow}>
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
            <Stack horizontal tokens={stackTokens} className={classNames.sizeRow}>
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
