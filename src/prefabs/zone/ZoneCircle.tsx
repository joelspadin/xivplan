import { IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { Circle } from 'react-konva';
import icon from '../../assets/zone/circle.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { CompactSwatchColorPicker } from '../../CompactSwatchColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import {
    CENTER_DOT_RADIUS,
    COLOR_SWATCHES,
    DEFAULT_AOE_COLOR,
    DEFAULT_AOE_OPACITY,
    SELECTED_PROPS,
} from '../../render/SceneTheme';
import { CircleZone, ObjectType } from '../../scene';
import { useScene } from '../../SceneProvider';
import { setOrOmit } from '../../util';
import { MIN_RADIUS } from '../bounds';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { useShowHighlight } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { RadiusObjectContainer } from '../RadiusObjectContainer';
import { HollowToggle } from './HollowToggle';
import { getZoneStyle } from './style';

const NAME = 'Circle';

const DEFAULT_RADIUS = 50;

export const ZoneCircle: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={icon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Circle,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<CircleZone>(ObjectType.Circle, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Circle,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            ...object,
            ...position,
        },
    };
});

interface CircleRendererProps extends RendererProps<CircleZone> {
    radius: number;
    isDragging?: boolean;
}

const CircleRenderer: React.FC<CircleRendererProps> = ({ object, radius, isDragging }) => {
    const showHighlight = useShowHighlight(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, radius * 2, object.hollow),
        [object.color, object.opacity, object.hollow, radius],
    );

    return (
        <>
            {showHighlight && <Circle radius={radius + style.strokeWidth / 2} {...SELECTED_PROPS} />}

            <Circle radius={radius} {...style} />

            {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
        </>
    );
};

const CircleContainer: React.FC<RendererProps<CircleZone>> = ({ object }) => {
    return (
        <RadiusObjectContainer object={object}>
            {(props) => <CircleRenderer object={object} {...props} />}
        </RadiusObjectContainer>
    );
};

registerRenderer<CircleZone>(ObjectType.Circle, LayerName.Ground, CircleContainer);

const CircleDetails: React.FC<ListComponentProps<CircleZone>> = ({ object, isNested }) => {
    return <DetailsItem icon={icon} name={NAME} object={object} color={object.color} isNested={isNested} />;
};

registerListComponent<CircleZone>(ObjectType.Circle, CircleDetails);

function supportsHollow(object: CircleZone) {
    return [ObjectType.Circle, ObjectType.RotateCW, ObjectType.RotateCCW].includes(object.type);
}

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const CircleEditControl: React.FC<PropertiesControlProps<CircleZone>> = ({ object }) => {
    const { dispatch } = useScene();

    const onRadiusChanged = useSpinChanged(
        (radius: number) => dispatch({ type: 'update', value: { ...object, radius } }),
        [dispatch, object],
    );

    const onColorChanged = useCallback(
        (color: string) => dispatch({ type: 'update', value: { ...object, color } }),
        [dispatch, object],
    );

    const onHollowChanged = useCallback(
        (hollow: boolean) => dispatch({ type: 'update', value: setOrOmit(object, 'hollow', hollow) }),
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

    return (
        <Stack>
            <Stack horizontal tokens={stackTokens}>
                <Stack.Item grow>
                    <CompactColorPicker label="Color" color={object.color} onChange={onColorChanged} />
                </Stack.Item>
                {supportsHollow(object) && (
                    <HollowToggle label="Style" checked={object.hollow} onChange={onHollowChanged} />
                )}
            </Stack>
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
        </Stack>
    );
};

registerPropertiesControl<CircleZone>(
    [
        ObjectType.Circle,
        ObjectType.Stack,
        ObjectType.Proximity,
        ObjectType.Knockback,
        ObjectType.RotateCW,
        ObjectType.RotateCCW,
        ObjectType.Eye,
    ],
    CircleEditControl,
);
