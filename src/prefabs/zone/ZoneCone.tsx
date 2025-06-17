import { WedgeConfig } from 'konva/lib/shapes/Wedge';
import React, { useCallback, useMemo, useState } from 'react';
import { Group, Shape, Wedge } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { useScene } from '../../SceneProvider';
import Icon from '../../assets/zone/cone.svg?react';
import { getPointerAngle, snapAngle } from '../../coord';
import { getResizeCursor } from '../../cursor';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../../render/ObjectRegistry';
import { ActivePortal } from '../../render/Portals';
import { LayerName } from '../../render/layers';
import { DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS, sceneVars } from '../../render/sceneTheme';
import { ConeZone, ObjectType } from '../../scene';
import { usePanelDrag } from '../../usePanelDrag';
import { clamp, degtorad, mod360 } from '../../util';
import { distance } from '../../vector';
import { CONTROL_POINT_BORDER_COLOR, HandleFuncProps, HandleStyle, createControlPointManager } from '../ControlPoint';
import { DraggableObject } from '../DraggableObject';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { MAX_CONE_ANGLE, MIN_CONE_ANGLE, MIN_RADIUS } from '../bounds';
import { useShowHighlight, useShowResizer } from '../highlight';
import { getZoneStyle } from './style';

const NAME = 'Cone';

const DEFAULT_RADIUS = 150;
const DEFAULT_ANGLE = 90;

const ICON_SIZE = 32;

export const ZoneCone: React.FC = () => {
    const [, setDragObject] = usePanelDrag();

    return (
        <PrefabIcon
            draggable
            name={NAME}
            icon={<Icon />}
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

const ConeRenderer: React.FC<ConeRendererProps> = ({ object, radius, rotation, coneAngle }) => {
    const isSelected = useShowHighlight(object);
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
            <HideGroup>
                <Wedge radius={radius} angle={coneAngle} {...style} />
            </HideGroup>
        </Group>
    );
};

function stateChanged(object: ConeZone, state: ConeState) {
    return state.radius !== object.radius || state.rotation !== object.rotation || state.coneAngle !== object.coneAngle;
}

const ConeContainer: React.FC<RendererProps<ConeZone>> = ({ object }) => {
    const { dispatch } = useScene();
    const showResizer = useShowResizer(object);
    const [resizing, setResizing] = useState(false);
    const [dragging, setDragging] = useState(false);

    const updateObject = useCallback(
        (state: ConeState) => {
            state.rotation = Math.round(state.rotation);
            state.coneAngle = Math.round(state.coneAngle);

            if (!stateChanged(object, state)) {
                return;
            }

            dispatch({ type: 'update', value: { ...object, ...state } });
        },
        [dispatch, object],
    );

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object} onActive={setDragging}>
                <ConeControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                >
                    {(props) => <ConeRenderer object={object} {...props} />}
                </ConeControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<ConeZone>(ObjectType.Cone, LayerName.Ground, ConeContainer);

const ConeDetails: React.FC<ListComponentProps<ConeZone>> = ({ object, ...props }) => {
    return (
        <DetailsItem
            icon={<Icon width="100%" height="100%" style={{ [sceneVars.colorZoneOrange]: object.color }} />}
            name={NAME}
            object={object}
            {...props}
        />
    );
};

registerListComponent<ConeZone>(ObjectType.Cone, ConeDetails);

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
            return clamp(coneAngle * 2, MIN_CONE_ANGLE, MAX_CONE_ANGLE);
        }
        if (activeHandleId === HandleId.Angle2) {
            const coneAngle = snapAngle(
                mod360(angle - object.rotation + 270) - 270,
                ROTATE_SNAP_DIVISION,
                ROTATE_SNAP_TOLERANCE,
            );

            return clamp(-coneAngle * 2, MIN_CONE_ANGLE, MAX_CONE_ANGLE);
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
