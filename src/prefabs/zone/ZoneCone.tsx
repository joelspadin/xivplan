import { IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React, { useCallback, useMemo, useState } from 'react';
import { Group, Wedge } from 'react-konva';
import icon from '../../assets/zone/cone.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { GroundPortal } from '../../render/Portals';
import { COLOR_SWATCHES, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { ConeZone, ObjectType } from '../../scene';
import { useScene } from '../../SceneProvider';
import { useIsSelected } from '../../SelectionProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { setOrOmit } from '../../util';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { DraggableObject } from '../DraggableObject';
import { PrefabIcon } from '../PrefabIcon';
import { HollowToggle } from './HollowToggle';
import { getZoneStyle } from './style';

const DEFAULT_RADIUS = 150;
const DEFAULT_ANGLE = 90;
const MIN_RADIUS = 10;
const MIN_ANGLE = 5;
const MAX_ANGLE = 360;

const ICON_SIZE = 32;

export const ZoneCone: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name="Cone AOE"
            icon={icon}
            onDragStart={(e) => {
                const offset = getDragOffset(e);
                setDragObject({
                    object: {
                        type: ObjectType.Cone,
                    },
                    offset: {
                        x: offset.x,
                        y: offset.y - ICON_SIZE / 2,
                    },
                });
            }}
        />
    );
};

registerDropHandler<ConeZone>(ObjectType.Cone, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Cone,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            coneAngle: DEFAULT_ANGLE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const ConeRenderer: React.FC<RendererProps<ConeZone>> = ({ object, index }) => {
    const isSelected = useIsSelected(index);
    const [active, setActive] = useState(false);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, object.radius * 2, object.hollow),
        [object.color, object.opacity, object.radius, object.hollow],
    );

    return (
        <GroundPortal isActive={active}>
            <DraggableObject object={object} index={index} onActive={setActive}>
                <Group rotation={object.rotation - 90 - object.coneAngle / 2}>
                    {isSelected && (
                        <Wedge
                            x={-style.strokeWidth / Math.SQRT2 / 2}
                            y={-style.strokeWidth / Math.SQRT2 / 2}
                            radius={object.radius + style.strokeWidth / Math.SQRT2}
                            angle={object.coneAngle}
                            {...SELECTED_PROPS}
                        />
                    )}
                    <Wedge radius={object.radius} angle={object.coneAngle} {...style} />
                </Group>
            </DraggableObject>
        </GroundPortal>
    );
};

registerRenderer<ConeZone>(ObjectType.Cone, ConeRenderer);

const ConeDetails: React.FC<ListComponentProps<ConeZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Cone" index={index} />;
};

registerListComponent<ConeZone>(ObjectType.Cone, ConeDetails);

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const ConeEditControl: React.FC<PropertiesControlProps<ConeZone>> = ({ object, index }) => {
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
        (opacity: number) => {
            if (opacity !== object.opacity) {
                dispatch({ type: 'update', index, value: { ...object, opacity } });
            }
        },
        [dispatch, object, index],
    );

    const onAngleChanged = useSpinChanged(
        (coneAngle: number) => dispatch({ type: 'update', index, value: { ...object, coneAngle } }),
        [dispatch, object, index],
    );

    const onRotationChanged = useSpinChanged(
        (rotation: number) => dispatch({ type: 'update', index, value: { ...object, rotation: rotation % 360 } }),
        [dispatch, object, index],
    );

    return (
        <Stack>
            <Stack horizontal tokens={stackTokens}>
                <CompactColorPicker
                    label="Color"
                    color={object.color}
                    swatches={COLOR_SWATCHES}
                    onChange={onColorChanged}
                />
                <HollowToggle label="Style" checked={object.hollow} onChange={onHollowChanged} />
            </Stack>
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

                <SpinButtonUnits
                    label="Angle"
                    labelPosition={Position.top}
                    value={object.coneAngle.toString()}
                    onChange={onAngleChanged}
                    min={MIN_ANGLE}
                    max={MAX_ANGLE}
                    step={5}
                    suffix="°"
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

registerPropertiesControl<ConeZone>(ObjectType.Cone, ConeEditControl);
