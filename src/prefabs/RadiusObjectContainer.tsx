import React, { useCallback, useState } from 'react';
import { Circle, Line } from 'react-konva';
import { snapAngle } from '../coord';
import { ActivePortal } from '../render/Portals';
import { isRotateable, RadiusObject, SceneObject, UnknownObject } from '../scene';
import { useScene } from '../SceneProvider';
import { distance, radtodeg } from '../util';
import { MIN_RADIUS } from './bounds';
import {
    CONTROL_POINT_BORDER_COLOR,
    createControlPointManager,
    Handle,
    HandleFuncProps,
    HandleStyle,
} from './ControlPoint';
import { DraggableObject } from './DraggableObject';
import { useShowResizer } from './highlight';

interface ControlPointProps {
    allowRotate?: boolean;
}

export interface RadiusObjectState {
    radius: number;
    rotation: number;
}

export interface RadiusObjectContainerProps extends ControlPointProps {
    object: RadiusObject & UnknownObject;
    index: number;
    children: (state: RadiusObjectState) => React.ReactElement;
    onTransformEnd?(state: RadiusObjectState): void;
}

export const RadiusObjectContainer: React.VFC<RadiusObjectContainerProps> = ({
    object,
    index,
    onTransformEnd,
    children,
    allowRotate,
}) => {
    const [, dispatch] = useScene();
    const showResizer = useShowResizer(object, index);
    const [resizing, setResizing] = useState(false);
    const [dragging, setDragging] = useState(false);

    const updateObject = useCallback(
        (state: RadiusObjectState) => {
            const rotateable = isRotateable(object);

            if (state.radius === object.radius && (!rotateable || state.rotation === object.rotation)) {
                return;
            }

            const update = rotateable
                ? { radius: state.radius, rotation: Math.round(state.rotation) }
                : { radius: state.radius };

            dispatch({ type: 'update', index, value: { ...object, ...update } as SceneObject });
            onTransformEnd?.(state);
        },
        [dispatch, onTransformEnd, object, index],
    );

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object} index={index} onActive={setDragging}>
                <RadiusControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                    allowRotate={allowRotate}
                >
                    {children}
                </RadiusControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

enum HandleIndex {
    Top,
    Bottom,
    Left,
    Right,
    Rotate,
}

const OUTSET = 2;
const ROTATE_HANDLE_OFFSET = 50;

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;

function getRadius(object: RadiusObject, { pointerPos, activeIndex }: HandleFuncProps) {
    if (pointerPos && activeIndex !== HandleIndex.Rotate) {
        return Math.max(MIN_RADIUS, Math.round(distance(pointerPos) - OUTSET));
    }

    return object.radius;
}

function getRotation(
    object: RadiusObject,
    { pointerPos, activeIndex }: HandleFuncProps,
    { allowRotate }: ControlPointProps,
) {
    if (!allowRotate || !isRotateable(object)) {
        return 0;
    }

    if (pointerPos && activeIndex === HandleIndex.Rotate) {
        const angle = 90 - radtodeg(Math.atan2(pointerPos.y, pointerPos.x));
        return snapAngle(angle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE);
    }

    return object.rotation;
}

function getCursor(angle: number): string {
    angle = (((angle % 360) + 360) % 360) - 22.5;

    if (angle <= 0) {
        return 'ns-resize';
    }
    if (angle <= 45) {
        return 'nesw-resize';
    }
    if (angle <= 90) {
        return 'ew-resize';
    }
    if (angle <= 135) {
        return 'nwse-resize';
    }
    if (angle <= 180) {
        return 'ns-resize';
    }
    if (angle <= 225) {
        return 'nesw-resize';
    }
    if (angle <= 270) {
        return 'ew-resize';
    }
    if (angle <= 315) {
        return 'nwse-resize';
    }
    return 'ns-resize';
}

function getNormalHandles(r: number, rotation: number): Handle[] {
    return [
        { style: HandleStyle.Square, cursor: getCursor(rotation), x: 0, y: -r },
        { style: HandleStyle.Square, cursor: getCursor(rotation + 180), x: 0, y: r },
        { style: HandleStyle.Square, cursor: getCursor(rotation + 270), x: -r, y: 0 },
        { style: HandleStyle.Square, cursor: getCursor(rotation + 90), x: r, y: 0 },
    ];
}

function getRotateHandle(r: number): Handle {
    return { style: HandleStyle.Square, cursor: 'crosshair', x: 0, y: -r - ROTATE_HANDLE_OFFSET };
}

const RadiusControlPoints = createControlPointManager<RadiusObject, RadiusObjectState, ControlPointProps>({
    handleFunc: (object, handle, props) => {
        const radius = getRadius(object, handle) + OUTSET;
        const rotation = isRotateable(object) ? object.rotation : 0;
        const handles = getNormalHandles(radius, rotation);

        if (props.allowRotate) {
            handles.push(getRotateHandle(radius));
        }

        return handles;
    },
    getRotation: getRotation,
    stateFunc: (object, handle, props) => {
        const radius = getRadius(object, handle);
        const rotation = getRotation(object, handle, props);

        return { radius, rotation };
    },
    onRenderBorder: (object, state, handles, { allowRotate }) => {
        return (
            <>
                {allowRotate && (
                    <Line
                        points={[0, -state.radius, 0, -state.radius - ROTATE_HANDLE_OFFSET]}
                        stroke={CONTROL_POINT_BORDER_COLOR}
                        strokeWidth={1}
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
