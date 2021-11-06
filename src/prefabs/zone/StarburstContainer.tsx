import React, { useCallback, useState } from 'react';
import { Circle, Line } from 'react-konva';
import { getPointerAngle, rotateCoord, snapAngle } from '../../coord';
import { ActivePortal } from '../../render/Portals';
import { StarburstZone, UnknownObject } from '../../scene';
import { useScene } from '../../SceneProvider';
import { distance } from '../../util';
import { MIN_RADIUS } from '../bounds';
import { CONTROL_POINT_BORDER_COLOR, createControlPointManager, HandleFuncProps, HandleStyle } from '../ControlPoint';
import { getResizeCursor } from '../cursor';
import { DraggableObject } from '../DraggableObject';
import { useShowResizer } from '../highlight';

interface StarburstControlProps {
    minSpokeWidth: number;
}

export interface StarburstObjectState {
    radius: number;
    rotation: number;
    spokeWidth: number;
}

export interface StarburstContainerProps extends StarburstControlProps {
    object: StarburstZone & UnknownObject;
    index: number;
    children: (state: StarburstObjectState) => React.ReactElement;
    onTransformEnd?(state: StarburstObjectState): void;
}

export const StarburstControlContainer: React.VFC<StarburstContainerProps> = ({
    object,
    index,
    onTransformEnd,
    children,
    minSpokeWidth,
}) => {
    const [, dispatch] = useScene();
    const showResizer = useShowResizer(object, index);
    const [resizing, setResizing] = useState(false);
    const [dragging, setDragging] = useState(false);

    const updateObject = useCallback(
        (state: StarburstObjectState) => {
            state.rotation = Math.round(state.rotation);

            if (!stateChanged(object, state)) {
                return;
            }

            dispatch({ type: 'update', index, value: { ...object, ...state } });
            onTransformEnd?.(state);
        },
        [dispatch, onTransformEnd, object, index],
    );

    return (
        <ActivePortal isActive={dragging || resizing}>
            <DraggableObject object={object} index={index} onActive={setDragging}>
                <StarburstControlPoints
                    object={object}
                    onActive={setResizing}
                    visible={showResizer && !dragging}
                    onTransformEnd={updateObject}
                    minSpokeWidth={minSpokeWidth}
                >
                    {children}
                </StarburstControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};

function stateChanged(object: StarburstZone, state: StarburstObjectState) {
    if (state.radius !== object.radius) {
        return true;
    }

    if (state.rotation !== object.rotation) {
        return true;
    }

    if (state.spokeWidth !== object.spokeWidth) {
        return true;
    }

    return false;
}

enum HandleId {
    Radius,
    Rotate,
    SpokeWidth,
}

const OUTSET = 2;
const ROTATE_HANDLE_OFFSET = 50;

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;

function getRadius(object: StarburstZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Radius) {
        return Math.max(MIN_RADIUS, Math.round(distance(pointerPos) - OUTSET));
    }

    return object.radius;
}

function getSpokeWidth(
    object: StarburstZone,
    { pointerPos, activeHandleId }: HandleFuncProps,
    { minSpokeWidth }: StarburstControlProps,
) {
    if (pointerPos && activeHandleId === HandleId.SpokeWidth) {
        const pos = rotateCoord(pointerPos, -object.rotation);
        return Math.max(pos.x * 2, minSpokeWidth);
    }

    return object.spokeWidth;
}

function getRotation(object: StarburstZone, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Rotate) {
        const angle = getPointerAngle(pointerPos);
        return snapAngle(angle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE);
    }

    return object.rotation;
}

const StarburstControlPoints = createControlPointManager<StarburstZone, StarburstObjectState, StarburstControlProps>({
    handleFunc: (object, handle, props) => {
        const r = getRadius(object, handle) + OUTSET;
        const spokeWidth = getSpokeWidth(object, handle, props);
        const rotation = object.rotation;

        const spokeX = spokeWidth / 2;
        const spokeY = (r * 2) / 3;

        return [
            { id: HandleId.Radius, style: HandleStyle.Square, cursor: getResizeCursor(rotation + 0), x: 0, y: -r },
            { id: HandleId.Radius, style: HandleStyle.Square, cursor: getResizeCursor(rotation + 180), x: 0, y: r },
            { id: HandleId.Radius, style: HandleStyle.Square, cursor: getResizeCursor(rotation + 270), x: -r, y: 0 },
            { id: HandleId.Radius, style: HandleStyle.Square, cursor: getResizeCursor(rotation + 90), x: r, y: 0 },
            { id: HandleId.Rotate, style: HandleStyle.Square, cursor: 'crosshair', x: 0, y: -r - ROTATE_HANDLE_OFFSET },
            {
                id: HandleId.SpokeWidth,
                style: HandleStyle.Diamond,
                cursor: getResizeCursor(rotation + 90),
                x: spokeX,
                y: -spokeY,
            },
        ];
    },
    getRotation: getRotation,
    stateFunc: (object, handle, props) => {
        const radius = getRadius(object, handle);
        const rotation = getRotation(object, handle);
        const spokeWidth = getSpokeWidth(object, handle, props);

        return { radius, rotation, spokeWidth };
    },
    onRenderBorder: (object, state) => {
        return (
            <>
                <Line
                    points={[0, -state.radius, 0, -state.radius - ROTATE_HANDLE_OFFSET]}
                    stroke={CONTROL_POINT_BORDER_COLOR}
                    strokeWidth={1}
                />

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