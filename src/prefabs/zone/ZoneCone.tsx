import { IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { Wedge } from 'react-konva';
import icon from '../../assets/zone/cone.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/LayerList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { useCanvasCoord } from '../../render/coord';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { AOE_COLOR_SWATCHES, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY } from '../../render/SceneTheme';
import { ConeZone, ObjectType } from '../../scene';
import { updateListObject, useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { PrefabIcon } from '../PrefabIcon';
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
        type: 'zones',
        op: 'add',
        value: {
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

const ConeRenderer: React.FC<RendererProps<ConeZone>> = ({ object }) => {
    const center = useCanvasCoord(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, object.radius * 2),
        [object.color, object.opacity, object.radius],
    );

    return (
        <Wedge
            x={center.x}
            y={center.y}
            radius={object.radius}
            angle={object.coneAngle}
            rotation={object.rotation - 90 - object.coneAngle / 2}
            {...style}
        />
    );
};

registerRenderer<ConeZone>(ObjectType.Cone, ConeRenderer);

const ConeDetails: React.FC<ListComponentProps<ConeZone>> = ({ layer, index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name="Cone" layer={layer} index={index} />;
};

registerListComponent<ConeZone>(ObjectType.Cone, ConeDetails);

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const ConeEditControl: React.FC<PropertiesControlProps<ConeZone>> = ({ object, layer, index }) => {
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

    const onAngleChanged = useSpinChanged(
        (coneAngle: number) => updateListObject(dispatch, layer, index, { ...object, coneAngle }),
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
