import { IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import { WedgeConfig } from 'konva/lib/shapes/Wedge';
import React, { useCallback, useMemo, useState } from 'react';
import { Group, Shape, Wedge } from 'react-konva';
import icon from '../../assets/zone/cone.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { CompactSwatchColorPicker } from '../../CompactSwatchColorPicker';
import { getPointerAngle, snapAngle } from '../../coord';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { LayerName } from '../../render/layers';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { ActivePortal } from '../../render/Portals';
import { COLOR_SWATCHES, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { ConeZone, ObjectType } from '../../scene';
import { useScene } from '../../SceneProvider';
import { SpinButtonUnits } from '../../SpinButtonUnits';
import { clamp, degtorad, distance, mod360, setOrOmit } from '../../util';
import { MIN_RADIUS } from '../bounds';
import { MoveableObjectProperties, useSpinChanged } from '../CommonProperties';
import { CONTROL_POINT_BORDER_COLOR, createControlPointManager, HandleFuncProps, HandleStyle } from '../ControlPoint';
import { getResizeCursor } from '../cursor';
import { DraggableObject } from '../DraggableObject';
import { useShowHighlight, useShowResizer } from '../highlight';
import { PrefabIcon } from '../PrefabIcon';
import { HollowToggle } from './HollowToggle';
import { getZoneStyle } from './style';

const NAME = 'Cone';

const DEFAULT_RADIUS = 150;
const DEFAULT_ANGLE = 90;
const MIN_ANGLE = 5;
const MAX_ANGLE = 360;

const ICON_SIZE = 32;

export const ZoneCone: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
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

interface OffsetWedgeProps extends WedgeConfig {
    shapeOffset: number;
}

const OffsetWedge: React.FC<OffsetWedgeProps> = ({ radius, angle, shapeOffset, ...props }) => {
    const { offsetRadius, angleRad, pointX, pointY, cornerX1, cornerY1, cornerX2, cornerY2 } = useMemo(() => {
        const angleRad = degtorad(angle);
        const offsetRadius = radius + shapeOffset;

        const arcX1 = offsetRadius;
        const arcY1 = 0;
        const arcX2 = offsetRadius * Math.cos(angleRad);
        const arcY2 = offsetRadius * Math.sin(angleRad);

        const cornerX1 = arcX1;
        const cornerY1 = arcY1 - shapeOffset;
        const cornerX2 = arcX2 + shapeOffset * Math.cos(angleRad + Math.PI / 2);
        const cornerY2 = arcY2 + shapeOffset * Math.sin(angleRad + Math.PI / 2);

        // At 360 degrees, divisor goes to 0. Put the point in the center.
        // At <= 15 degrees, pointDist becomes large and shows a gap with the
        // non-offset shape. Limit pointDist to prevent that.
        const divisor = Math.sin(angleRad / 2);
        const pointDist = Math.min(shapeOffset * 2, divisor <= 0.001 ? 0 : shapeOffset / divisor);

        const pointX = -pointDist * Math.cos(angleRad / 2);
        const pointY = -pointDist * Math.sin(angleRad / 2);

        return { offsetRadius, angleRad, pointX, pointY, cornerX1, cornerY1, cornerX2, cornerY2 };
    }, [radius, angle, shapeOffset]);

    return (
        <Shape
            {...props}
            sceneFunc={(ctx, shape) => {
                ctx.beginPath();

                ctx.arc(0, 0, offsetRadius, 0, angleRad, false);
                ctx.lineTo(cornerX2, cornerY2);
                ctx.lineTo(pointX, pointY);
                ctx.lineTo(cornerX1, cornerY1);

                ctx.closePath();
                ctx.fillStrokeShape(shape);
            }}
        />
    );
};

interface ConeRendererProps extends RendererProps<ConeZone> {
    radius: number;
    rotation: number;
    coneAngle: number;
}

const ConeRenderer: React.FC<ConeRendererProps> = ({ object, index, radius, rotation, coneAngle }) => {
    const isSelected = useShowHighlight(object, index);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, radius * 2, object.hollow),
        [object.color, object.opacity, radius, object.hollow],
    );

    return (
        <Group rotation={rotation - 90 - coneAngle / 2}>
            {isSelected && (
                <OffsetWedge
                    radius={radius}
                    angle={coneAngle}
                    shapeOffset={style.strokeWidth / 2}
                    {...SELECTED_PROPS}
                />
            )}
            <Wedge radius={radius} angle={coneAngle} {...style} />
        </Group>
    );
};

function stateChanged(object: ConeZone, state: ConeState) {
    return state.radius !== object.radius || state.rotation !== object.rotation || state.coneAngle !== object.coneAngle;
}

const ConeContainer: React.FC<RendererProps<ConeZone>> = ({ object, index }) => {
    const [, dispatch] = useScene();
    const showResizer = useShowResizer(object, index);
    const [resizing, setResizing] = useState(false);
    const [dragging, setDragging] = useState(false);

    const updateObject = useCallback(
        (state: ConeState) => {
            state.rotation = Math.round(state.rotation);

            if (!stateChanged(object, state)) {
                return;
            }

            dispatch({ type: 'update', index, value: { ...object, ...state } });
        },
        [dispatch, object, index],
    );

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object} index={index} onActive={setDragging}>
                <ConeControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                >
                    {({ radius, rotation, coneAngle }) => (
                        <ConeRenderer
                            object={object}
                            index={index}
                            radius={radius}
                            rotation={rotation}
                            coneAngle={coneAngle}
                        />
                    )}
                </ConeControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<ConeZone>(ObjectType.Cone, LayerName.Ground, ConeContainer);

const ConeDetails: React.FC<ListComponentProps<ConeZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={icon} name={NAME} index={index} />;
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
                <CompactColorPicker label="Color" color={object.color} onChange={onColorChanged} />
                <HollowToggle label="Style" checked={object.hollow} onChange={onHollowChanged} />
            </Stack>
            <CompactSwatchColorPicker color={object.color} swatches={COLOR_SWATCHES} onChange={onColorChanged} />

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

enum HandleId {
    Radius,
    Angle1,
    Angle2,
}

interface ConeState {
    radius: number;
    rotation: number;
    coneAngle: number;
}

const OUTSET = 2;

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;

function getRadius(object: ConeZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Radius) {
        return Math.max(MIN_RADIUS, Math.round(distance(pointerPos) - OUTSET));
    }

    return object.radius;
}

function getRotation(object: ConeZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Radius) {
        const angle = getPointerAngle(pointerPos);
        return snapAngle(angle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE);
    }

    return object.rotation;
}

function getConeAngle(object: ConeZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos) {
        const angle = getPointerAngle(pointerPos);

        if (activeHandleId === HandleId.Angle1) {
            const coneAngle = snapAngle(
                mod360(angle - object.rotation + 90) - 90,
                ROTATE_SNAP_DIVISION,
                ROTATE_SNAP_TOLERANCE,
            );
            return clamp(coneAngle * 2, MIN_ANGLE, MAX_ANGLE);
        }
        if (activeHandleId === HandleId.Angle2) {
            const coneAngle = snapAngle(
                mod360(angle - object.rotation + 270) - 270,
                ROTATE_SNAP_DIVISION,
                ROTATE_SNAP_TOLERANCE,
            );

            return clamp(-coneAngle * 2, MIN_ANGLE, MAX_ANGLE);
        }
    }

    return object.coneAngle;
}

const ConeControlPoints = createControlPointManager<ConeZone, ConeState>({
    handleFunc: (object, handle) => {
        const radius = getRadius(object, handle) + OUTSET;
        const rotation = getRotation(object, handle);
        const coneAngle = getConeAngle(object, handle);

        const x = radius * Math.sin(degtorad(coneAngle / 2));
        const y = radius * Math.cos(degtorad(coneAngle / 2));

        return [
            { id: HandleId.Radius, style: HandleStyle.Square, cursor: getResizeCursor(rotation), x: 0, y: -radius },
            { id: HandleId.Angle1, style: HandleStyle.Diamond, cursor: 'crosshair', x: x, y: -y },
            { id: HandleId.Angle2, style: HandleStyle.Diamond, cursor: 'crosshair', x: -x, y: -y },
        ];
    },
    getRotation: getRotation,
    stateFunc: (object, handle) => {
        const radius = getRadius(object, handle);
        const rotation = getRotation(object, handle);
        const coneAngle = getConeAngle(object, handle);

        return { radius, rotation, coneAngle };
    },
    onRenderBorder: (object, state) => {
        return (
            <OffsetWedge
                rotation={-90 - state.coneAngle / 2}
                radius={state.radius}
                angle={state.coneAngle}
                shapeOffset={1}
                stroke={CONTROL_POINT_BORDER_COLOR}
                fillEnabled={false}
            />
        );
    },
});
