import React, { useState } from 'react';
import { Circle, Rect } from 'react-konva';
import { getAbsoluteRotation, getBaseFacingRotation, getPointerAngle, snapAngle } from '../coord';
import { getResizeCursor } from '../cursor';
import type { RendererProps } from '../render/ObjectRegistry';
import { ActivePortal } from '../render/Portals';
import type { LineProps, Scene, SceneObject } from '../scene';
import { useScene } from '../SceneProvider';
import { useIsDragging } from '../selection';
import { CENTER_DOT_RADIUS } from '../theme';
import { clampRotation, mod360, type Enum } from '../util';
import { distance, getDistanceFromLine, VEC_ZERO, vecAtAngle } from '../vector';
import { createControlPointManager, type ControlledObjectStateBase } from './ControlPoint';
import { CONTROL_POINT_BORDER_COLOR, HandleStyle, type HandleFuncProps } from './controlpoints';
import { DraggableObject } from './DraggableObject';
import { useShowResizer } from './highlight';

interface LineState extends ControlledObjectStateBase {
    length: number;
    width: number;
    rotation: number;
}

function lineStateChanged(object: LineProps, state: LineState) {
    return (
        state.length !== object.length ||
        mod360(state.rotation) !== mod360(object.rotation) ||
        state.width !== object.width
    );
}

const HandleId = {
    Length: 0,
    Width: 1,
} as const;
type HandleId = Enum<typeof HandleId>;

const ROTATE_SNAP_DIVISION = 15;
const ROTATE_SNAP_TOLERANCE = 2;

const OUTSET = 2;

function getLength(object: LineProps, { pointerPos, activeHandleId }: HandleFuncProps, minLength: number) {
    if (pointerPos && activeHandleId === HandleId.Length) {
        return Math.max(minLength, Math.round(distance(pointerPos) - OUTSET));
    }

    return object.length;
}

function getRotation(scene: Readonly<Scene>, object: LineProps, { pointerPos, activeHandleId }: HandleFuncProps) {
    if (pointerPos && activeHandleId === HandleId.Length) {
        const angle = getPointerAngle(pointerPos);
        const baseRotation = getBaseFacingRotation(scene, object);
        return snapAngle(angle - baseRotation, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE) + baseRotation;
    }

    return getAbsoluteRotation(scene, object);
}

function getWidth(
    scene: Readonly<Scene>,
    object: LineProps,
    { pointerPos, activeHandleId }: HandleFuncProps,
    minWidth: number,
) {
    if (pointerPos && activeHandleId == HandleId.Width) {
        const start = VEC_ZERO;
        const end = vecAtAngle(getAbsoluteRotation(scene, object));
        const distance = getDistanceFromLine(start, end, pointerPos);

        return Math.max(minWidth, Math.round(distance * 2));
    }

    return object.width;
}

/** Control points for line-shaped objects (rectangular, origin is on the center of an edge). */
function createLineControlPoints(minWidth: number, minLength: number) {
    return createControlPointManager<LineProps, LineState>({
        handleFunc: (scene, object, handle) => {
            const length = getLength(object, handle, minLength) + OUTSET;
            const width = getWidth(scene, object, handle, minWidth);
            const rotation = getRotation(scene, object, handle);

            const x = width / 2;
            const y = -length / 2;

            return [
                { id: HandleId.Length, style: HandleStyle.Square, cursor: getResizeCursor(rotation), x: 0, y: -length },
                { id: HandleId.Width, style: HandleStyle.Diamond, cursor: getResizeCursor(rotation + 90), x: x, y: y },
                { id: HandleId.Width, style: HandleStyle.Diamond, cursor: getResizeCursor(rotation + 90), x: -x, y: y },
            ];
        },
        getRotation: getRotation,
        stateFunc: (scene, object, handle) => {
            const length = getLength(object, handle, minLength);
            const width = getWidth(scene, object, handle, minWidth);
            const rotation = getRotation(scene, object, handle);

            return { length, width, rotation };
        },
        onRenderBorder: (object, state) => {
            const strokeWidth = 1;
            const width = state.width + strokeWidth * 2;
            const length = state.length + strokeWidth * 2;

            return (
                <>
                    <Rect
                        x={-width / 2}
                        y={-length + strokeWidth}
                        width={width}
                        height={length}
                        stroke={CONTROL_POINT_BORDER_COLOR}
                        strokeWidth={strokeWidth}
                        fillEnabled={false}
                    />
                    <Circle radius={CENTER_DOT_RADIUS} fill={CONTROL_POINT_BORDER_COLOR} />
                </>
            );
        },
    });
}

export interface LineShapeRendererProps<T extends LineProps & SceneObject> extends RendererProps<T> {
    length: number;
    width: number;
    rotation: number;
    isDragging?: boolean;
}

export function createLineShapeContainer<T extends LineProps & SceneObject>(
    LineShapeRenderer: React.FC<LineShapeRendererProps<T>>,
    minWidth: number,
    minLength: number,
) {
    const LineControlPoints = createLineControlPoints(minWidth, minLength);
    const Container: React.FC<RendererProps<T>> = ({ object }) => {
        const { dispatch, scene } = useScene();
        const showResizer = useShowResizer(object);
        const [resizing, setResizing] = useState(false);
        const dragging = useIsDragging(object);

        const updateObject = (state: LineState) => {
            const baseRotation = getBaseFacingRotation(scene, object);
            state.rotation = clampRotation(state.rotation - baseRotation);
            state.width = Math.round(state.width);

            if (!lineStateChanged(object, state)) {
                return;
            }

            dispatch({ type: 'update', value: { ...object, ...state } });
        };

        return (
            <ActivePortal isActive={dragging || resizing}>
                <DraggableObject object={object}>
                    <LineControlPoints
                        object={object}
                        onActive={setResizing}
                        visible={showResizer && !dragging}
                        onTransformEnd={updateObject}
                    >
                        {(props) => <LineShapeRenderer object={object} isDragging={dragging || resizing} {...props} />}
                    </LineControlPoints>
                </DraggableObject>
            </ActivePortal>
        );
    };
    return Container;
}
