import { ArcConfig } from 'konva/lib/shapes/Arc';
import React, { useCallback, useMemo, useState } from 'react';
import { Arc, Circle, Group, Shape } from 'react-konva';
import { getDragOffset, registerDropHandler } from '../../DropHandler';
import { useScene } from '../../SceneProvider';
import icon from '../../assets/zone/arc.png';
import { getPointerAngle, snapAngle } from '../../coord';
import { getResizeCursor } from '../../cursor';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ListComponentRegistry';
import { RendererProps, registerRenderer } from '../../render/ObjectRegistry';
import { ActivePortal } from '../../render/Portals';
import { CENTER_DOT_RADIUS, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY, SELECTED_PROPS } from '../../render/SceneTheme';
import { LayerName } from '../../render/layers';
import { ArcZone, ObjectType } from '../../scene';
import { usePanelDrag } from '../../usePanelDrag';
import { clamp, degtorad, mod360 } from '../../util';
import { VEC_ZERO, distance, getIntersectionDistance, vecAtAngle, vecNormal } from '../../vector';
import { CONTROL_POINT_BORDER_COLOR, HandleFuncProps, HandleStyle, createControlPointManager } from '../ControlPoint';
import { DraggableObject } from '../DraggableObject';
import { HideGroup } from '../HideGroup';
import { PrefabIcon } from '../PrefabIcon';
import { MAX_CONE_ANGLE, MIN_CONE_ANGLE, MIN_RADIUS } from '../bounds';
import { useShowHighlight, useShowResizer } from '../highlight';
import { getZoneStyle } from './style';

const NAME = 'Arc';

const DEFAULT_RADIUS = 150;
const DEFAULT_INNER_RADIUS = 75;
const DEFAULT_ANGLE = 90;

const ICON_SIZE = 32;

export const ZoneArc: React.FC = () => {
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
                        type: ObjectType.Arc,
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

registerDropHandler<ArcZone>(ObjectType.Arc, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Arc,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            radius: DEFAULT_RADIUS,
            innerRadius: DEFAULT_INNER_RADIUS,
            coneAngle: DEFAULT_ANGLE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

interface OffsetArcProps extends ArcConfig {
    shapeOffset: number;
}

const OffsetArc: React.FC<OffsetArcProps> = ({ innerRadius, outerRadius, angle, shapeOffset, ...props }) => {
    const {
        offsetInnerRadius,
        offsetOuterRadius,
        angleRad,
        innerCornerX1,
        innerCornerY1,
        innerCornerX2,
        innerCornerY2,
        outerCornerX1,
        outerCornerY1,
        outerCornerX2,
        outerCornerY2,
    } = useMemo(() => {
        const angleRad = degtorad(angle);
        const offsetInnerRadius = innerRadius - shapeOffset;
        const offsetOuterRadius = outerRadius + shapeOffset;

        const innerArcX1 = offsetInnerRadius;
        const innerArcY1 = 0;
        const innerArcX2 = offsetInnerRadius * Math.cos(angleRad);
        const innerArcY2 = offsetInnerRadius * Math.sin(angleRad);

        const innerCornerX1 = innerArcX1;
        const innerCornerY1 = innerArcY1 - shapeOffset;
        const innerCornerX2 = innerArcX2 + shapeOffset * Math.cos(angleRad + Math.PI / 2);
        const innerCornerY2 = innerArcY2 + shapeOffset * Math.sin(angleRad + Math.PI / 2);

        const outerArcX1 = offsetOuterRadius;
        const outerArcY1 = 0;
        const outerArcX2 = offsetOuterRadius * Math.cos(angleRad);
        const outerArcY2 = offsetOuterRadius * Math.sin(angleRad);

        const outerCornerX1 = outerArcX1;
        const outerCornerY1 = outerArcY1 - shapeOffset;
        const outerCornerX2 = outerArcX2 + shapeOffset * Math.cos(angleRad + Math.PI / 2);
        const outerCornerY2 = outerArcY2 + shapeOffset * Math.sin(angleRad + Math.PI / 2);

        return {
            offsetInnerRadius,
            offsetOuterRadius,
            angleRad,
            innerCornerX1,
            innerCornerY1,
            innerCornerX2,
            innerCornerY2,
            outerCornerX1,
            outerCornerY1,
            outerCornerX2,
            outerCornerY2,
        };
    }, [innerRadius, outerRadius, angle, shapeOffset]);

    return (
        <Shape
            {...props}
            sceneFunc={(ctx, shape) => {
                ctx.beginPath();

                ctx.arc(0, 0, offsetInnerRadius, 0, angleRad, false);
                ctx.lineTo(innerCornerX2, innerCornerY2);
                ctx.lineTo(outerCornerX2, outerCornerY2);
                ctx.arc(0, 0, offsetOuterRadius, angleRad, 0, true);
                ctx.lineTo(innerCornerX1, innerCornerY1);
                ctx.lineTo(outerCornerX1, outerCornerY1);

                ctx.closePath();
                ctx.fillStrokeShape(shape);
            }}
        />
    );
};

interface ArcRendererProps extends RendererProps<ArcZone> {
    outerRadius: number;
    innerRadius: number;
    rotation: number;
    coneAngle: number;
    isDragging?: boolean;
}

const ArcRenderer: React.FC<ArcRendererProps> = ({
    object,
    outerRadius,
    innerRadius,
    rotation,
    coneAngle,
    isDragging,
}) => {
    const isSelected = useShowHighlight(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, outerRadius * 2, object.hollow),
        [object.color, object.opacity, outerRadius, object.hollow],
    );

    return (
        <Group rotation={rotation - 90 - coneAngle / 2}>
            {isSelected && (
                <OffsetArc
                    outerRadius={outerRadius}
                    innerRadius={innerRadius}
                    angle={coneAngle}
                    shapeOffset={style.strokeWidth / 2}
                    {...SELECTED_PROPS}
                />
            )}
            <HideGroup>
                {isDragging && <Circle radius={CENTER_DOT_RADIUS} fill={style.stroke} />}
                <Arc outerRadius={outerRadius} innerRadius={innerRadius} angle={coneAngle} {...style} />
            </HideGroup>
        </Group>
    );
};

function stateChanged(object: ArcZone, state: ArcState) {
    return (
        state.radius !== object.innerRadius ||
        state.innerRadius !== object.innerRadius ||
        state.rotation !== object.rotation ||
        state.coneAngle !== object.coneAngle
    );
}

const ArcContainer: React.FC<RendererProps<ArcZone>> = ({ object }) => {
    const { dispatch } = useScene();
    const showResizer = useShowResizer(object);
    const [resizing, setResizing] = useState(false);
    const [dragging, setDragging] = useState(false);

    const updateObject = useCallback(
        (state: ArcState) => {
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
                <ArcControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                >
                    {({ radius, innerRadius, rotation, coneAngle }) => (
                        <>
                            <ArcRenderer
                                object={object}
                                outerRadius={radius}
                                innerRadius={innerRadius}
                                rotation={rotation}
                                coneAngle={coneAngle}
                                isDragging={dragging}
                            />
                        </>
                    )}
                </ArcControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

registerRenderer<ArcZone>(ObjectType.Arc, LayerName.Ground, ArcContainer);

const ArcDetails: React.FC<ListComponentProps<ArcZone>> = ({ object, ...props }) => {
    return <DetailsItem icon={icon} name={NAME} object={object} color={object.color} {...props} />;
};

registerListComponent<ArcZone>(ObjectType.Arc, ArcDetails);

enum HandleId {
    Radius,
    InnerRadius,
    Angle1,
    Angle2,
}

interface ArcState {
    radius: number;
    innerRadius: number;
    rotation: number;
    coneAngle: number;
}

const OUTSET = 2;

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;

function getRadius(object: ArcZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Radius) {
        return Math.max(MIN_RADIUS, Math.round(distance(pointerPos) - OUTSET));
    }

    return object.radius;
}

function getInnerRadius(object: ArcZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.InnerRadius) {
        const u = vecAtAngle(object.rotation);
        const r = getIntersectionDistance(VEC_ZERO, u, pointerPos, vecNormal(u));

        if (!r) {
            return MIN_RADIUS;
        }

        return Math.max(MIN_RADIUS, Math.round(r + OUTSET));
    }

    return object.innerRadius;
}

function getRotation(object: ArcZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Radius) {
        const angle = getPointerAngle(pointerPos);
        return snapAngle(angle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE);
    }

    return object.rotation;
}

function getConeAngle(object: ArcZone, { pointerPos, activeHandleId }: HandleFuncProps) {
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

const ArcControlPoints = createControlPointManager<ArcZone, ArcState>({
    handleFunc: (object, handle) => {
        const radius = getRadius(object, handle) + OUTSET;
        const innerRadius = getInnerRadius(object, handle) - OUTSET;
        const rotation = getRotation(object, handle);
        const coneAngle = getConeAngle(object, handle);

        const x = radius * Math.sin(degtorad(coneAngle / 2));
        const y = radius * Math.cos(degtorad(coneAngle / 2));

        return [
            { id: HandleId.Radius, style: HandleStyle.Square, cursor: getResizeCursor(rotation), x: 0, y: -radius },
            {
                id: HandleId.InnerRadius,
                style: HandleStyle.Diamond,
                cursor: getResizeCursor(rotation),
                x: 0,
                y: -innerRadius,
            },
            { id: HandleId.Angle1, style: HandleStyle.Diamond, cursor: 'crosshair', x: x, y: -y },
            { id: HandleId.Angle2, style: HandleStyle.Diamond, cursor: 'crosshair', x: -x, y: -y },
        ];
    },
    getRotation: getRotation,
    stateFunc: (object, handle) => {
        const radius = getRadius(object, handle);
        const innerRadius = getInnerRadius(object, handle);
        const rotation = getRotation(object, handle);
        const coneAngle = getConeAngle(object, handle);

        return { radius, innerRadius, rotation, coneAngle };
    },
    onRenderBorder: (object, state) => {
        return (
            <>
                <Circle radius={CENTER_DOT_RADIUS} fill={CONTROL_POINT_BORDER_COLOR} />
                <OffsetArc
                    rotation={-90 - state.coneAngle / 2}
                    outerRadius={state.radius}
                    innerRadius={state.innerRadius}
                    angle={state.coneAngle}
                    shapeOffset={1}
                    stroke={CONTROL_POINT_BORDER_COLOR}
                    fillEnabled={false}
                />
            </>
        );
    },
});
