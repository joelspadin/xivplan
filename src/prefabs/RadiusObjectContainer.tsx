import React, { useCallback, useState } from 'react';
import { Circle, Line } from 'react-konva';
import { getPointerAngle, snapAngle } from '../coord';
import { ActivePortal } from '../render/Portals';
import { InnerRadiusObject, isRotateable, RadiusObject, SceneObject, UnknownObject } from '../scene';
import { useScene } from '../SceneProvider';
import { distance } from '../util';
import { MIN_RADIUS } from './bounds';
import {
    CONTROL_POINT_BORDER_COLOR,
    createControlPointManager,
    Handle,
    HandleFuncProps,
    HandleStyle,
} from './ControlPoint';
import { getResizeCursor } from './cursor';
import { DraggableObject } from './DraggableObject';
import { useShowResizer } from './highlight';

interface ControlPointProps {
    allowRotate?: boolean;
    allowInnerRadius?: boolean;
}

export interface RadiusObjectState {
    radius: number;
    rotation: number;
    innerRadius: number;
}

export interface RadiusObjectContainerProps extends ControlPointProps {
    object: RadiusObject & UnknownObject;
    children: (state: RadiusObjectState) => React.ReactElement;
    onTransformEnd?(state: RadiusObjectState): void;
}

export const RadiusObjectContainer: React.VFC<RadiusObjectContainerProps> = ({
    object,
    onTransformEnd,
    children,
    allowRotate,
    allowInnerRadius,
}) => {
    const [, dispatch] = useScene();
    const showResizer = useShowResizer(object);
    const [resizing, setResizing] = useState(false);
    const [dragging, setDragging] = useState(false);

    const updateObject = useCallback(
        (state: RadiusObjectState) => {
            state.rotation = Math.round(state.rotation);

            if (!stateChanged(object, state)) {
                return;
            }

            const update: Partial<RadiusObjectState> = { radius: state.radius };

            if (isRotateable(object)) {
                update.rotation = state.rotation;
            }
            if (isInnerRadiusObject(object)) {
                update.innerRadius = state.innerRadius;
            }

            dispatch({ type: 'update', value: { ...object, ...update } as SceneObject });
            onTransformEnd?.(state);
        },
        [dispatch, onTransformEnd, object],
    );

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object} onActive={setDragging}>
                <RadiusControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                    allowRotate={allowRotate}
                    allowInnerRadius={allowInnerRadius}
                >
                    {children}
                </RadiusControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

function stateChanged(object: RadiusObject, state: RadiusObjectState) {
    if (state.radius !== object.radius) {
        return true;
    }

    if (isRotateable(object) && state.rotation !== object.rotation) {
        return true;
    }

    if (isInnerRadiusObject(object) && state.innerRadius !== object.innerRadius) {
        return true;
    }

    return false;
}

enum HandleId {
    Radius,
    Rotate,
    InnerRadius,
}

const OUTSET = 2;
const ROTATE_HANDLE_OFFSET = 50;

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;

function getRadius(object: RadiusObject, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Radius) {
        return Math.max(MIN_RADIUS, Math.round(distance(pointerPos) - OUTSET));
    }

    return object.radius;
}

function isInnerRadiusObject(object: RadiusObject): object is RadiusObject & InnerRadiusObject {
    const innerRadiusObject = object as InnerRadiusObject & RadiusObject;
    return innerRadiusObject && typeof innerRadiusObject.innerRadius === 'number';
}

function getInnerRadius(
    object: RadiusObject,
    { pointerPos, activeHandleId }: HandleFuncProps,
    { allowInnerRadius }: ControlPointProps,
) {
    if (!allowInnerRadius || !isInnerRadiusObject(object)) {
        return 0;
    }

    if (pointerPos && activeHandleId === HandleId.InnerRadius) {
        return Math.max(MIN_RADIUS, Math.round(distance(pointerPos) + OUTSET));
    }

    return object.innerRadius;
}

function getRotation(
    object: RadiusObject,
    { pointerPos, activeHandleId }: HandleFuncProps,
    { allowRotate }: ControlPointProps,
) {
    if (!allowRotate || !isRotateable(object)) {
        return 0;
    }

    if (pointerPos && activeHandleId === HandleId.Rotate) {
        const angle = getPointerAngle(pointerPos);
        return snapAngle(angle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE);
    }

    return object.rotation;
}

function getNormalHandles(r: number, rotation: number): Handle[] {
    return [
        { id: HandleId.Radius, style: HandleStyle.Square, cursor: getResizeCursor(rotation), x: 0, y: -r },
        { id: HandleId.Radius, style: HandleStyle.Square, cursor: getResizeCursor(rotation + 180), x: 0, y: r },
        { id: HandleId.Radius, style: HandleStyle.Square, cursor: getResizeCursor(rotation + 270), x: -r, y: 0 },
        { id: HandleId.Radius, style: HandleStyle.Square, cursor: getResizeCursor(rotation + 90), x: r, y: 0 },
    ];
}

function getRotateHandle(r: number): Handle {
    return { id: HandleId.Rotate, style: HandleStyle.Square, cursor: 'crosshair', x: 0, y: -r - ROTATE_HANDLE_OFFSET };
}

function getInnerRadiusHandles(r: number): Handle[] {
    const d = Math.SQRT1_2 * r;
    return [
        { id: HandleId.InnerRadius, style: HandleStyle.Diamond, cursor: getResizeCursor(45), x: d, y: -d },
        { id: HandleId.InnerRadius, style: HandleStyle.Diamond, cursor: getResizeCursor(135), x: d, y: d },
        { id: HandleId.InnerRadius, style: HandleStyle.Diamond, cursor: getResizeCursor(225), x: -d, y: d },
        { id: HandleId.InnerRadius, style: HandleStyle.Diamond, cursor: getResizeCursor(315), x: -d, y: -d },
    ];
}

const RadiusControlPoints = createControlPointManager<RadiusObject, RadiusObjectState, ControlPointProps>({
    handleFunc: (object, handle, props) => {
        const radius = getRadius(object, handle) + OUTSET;
        const rotation = isRotateable(object) ? object.rotation : 0;
        const handles = getNormalHandles(radius, rotation);

        if (props.allowRotate) {
            handles.push(getRotateHandle(radius));
        }

        if (props.allowInnerRadius) {
            const innerRadius = getInnerRadius(object, handle, props) - OUTSET;
            handles.push(...getInnerRadiusHandles(innerRadius));
        }

        return handles;
    },
    getRotation: getRotation,
    stateFunc: (object, handle, props) => {
        const radius = getRadius(object, handle);
        const innerRadius = getInnerRadius(object, handle, props);
        const rotation = getRotation(object, handle, props);

        return { radius, rotation, innerRadius };
    },
    onRenderBorder: (object, state, { allowRotate, allowInnerRadius }) => {
        return (
            <>
                {allowRotate && (
                    <Line
                        points={[0, -state.radius, 0, -state.radius - ROTATE_HANDLE_OFFSET]}
                        stroke={CONTROL_POINT_BORDER_COLOR}
                        strokeWidth={1}
                    />
                )}
                {allowInnerRadius && (
                    <Circle
                        radius={state.innerRadius - OUTSET}
                        stroke={CONTROL_POINT_BORDER_COLOR}
                        strokeWidth={1}
                        fillEnabled={false}
                    />
                )}
                <Circle
                    radius={state.radius + OUTSET}
                    stroke={CONTROL_POINT_BORDER_COLOR}
                    strokeWidth={1}
                    fillEnabled={false}
                />
            </>
        );
    },
});
