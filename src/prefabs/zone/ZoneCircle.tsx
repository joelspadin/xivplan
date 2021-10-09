import { IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React, { useCallback, useMemo, useState } from 'react';
import { Circle } from 'react-konva';
import icon from '../../assets/zone/circle.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { GroundPortal } from '../../render/Portals';
import { COLOR_SWATCHES, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY } from '../../render/SceneTheme';
import { CircleZone, ObjectType } from '../../scene';
import { useScene } from '../../SceneProvider';
import { setOrOmit } from '../../util';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { DraggableObject } from '../DraggableObject';
import { PrefabIcon } from '../PrefabIcon';
import { HollowToggle } from './HollowToggle';
import { getZoneStyle } from './style';

const DEFAULT_RADIUS = 50;
const MIN_RADIUS = 10;

export const ZoneCircle: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name="Circle AOE"
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

const CircleRenderer: React.FC<RendererProps<CircleZone>> = ({ object, index }) => {
    const [active, setActive] = useState(false);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, object.radius * 2, object.hollow),
        [object.color, object.opacity, object.radius, object.hollow],
    );

    return (
        <GroundPortal isActive={active}>
            <DraggableObject object={object} index={index} onActive={setActive}>
                <Circle radius={object.radius} {...style} />
            </DraggableObject>
        </GroundPortal>
    );
};

registerRenderer<CircleZone>(ObjectType.Circle, CircleRenderer);

const CircleDetails: React.FC<ListComponentProps<CircleZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Circle" index={index} />;
};

registerListComponent<CircleZone>(ObjectType.Circle, CircleDetails);

function supportsHollow(object: CircleZone) {
    return [ObjectType.Circle, ObjectType.RotateCW, ObjectType.RotateCCW].includes(object.type);
}

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const CircleEditControl: React.FC<PropertiesControlProps<CircleZone>> = ({ object, index }) => {
    const [, dispatch] = useScene();

    const onRadiusChanged = useSpinChanged(
        (radius: number) => dispatch({ type: 'update', index, value: { ...object, radius } }),
        [dispatch, object, index],
    );

    const onColorChanged = useCallback(
        (color: string) => dispatch({ type: 'update', index, value: { ...object, color } }),
        [dispatch, object, index],
    );

    const onHollowChanged = useCallback(
        (hollow: boolean) => dispatch({ type: 'update', index, value: setOrOmit(object, 'hollow', hollow) }),
        [dispatch, object, index],
    );

    const onOpacityChanged = useCallback(
        (opacity: number) => dispatch({ type: 'update', index, value: { ...object, opacity } }),
        [dispatch, object, index],
    );

    return (
        <Stack>
            <Stack horizontal tokens={stackTokens}>
                <Stack.Item grow>
                    <CompactColorPicker
                        label="Color"
                        color={object.color}
                        swatches={COLOR_SWATCHES}
                        onChange={onColorChanged}
                    />
                </Stack.Item>
                {supportsHollow(object) && (
                    <HollowToggle label="Style" checked={object.hollow} onChange={onHollowChanged} />
                )}
            </Stack>
            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <MoveableObjectProperties object={object} index={index} />
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
