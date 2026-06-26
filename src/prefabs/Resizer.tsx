import type { Vector2d } from 'konva/lib/types';
import React, { useState } from 'react';
import { Line, Rect } from 'react-konva';
import {
    getAbsolutePosition,
    getAbsoluteRotation,
    getBaseFacingRotation,
    getPointerAngle,
    rotateCoord,
    snapAngle,
} from '../coord';
import { getResizeCursor } from '../cursor';
import { ActivePortal } from '../render/Portals';
import { type ResizeableObject, type Scene, type SceneObject, type UnknownObject } from '../scene';
import { useScene } from '../SceneProvider';
import { useIsDragging } from '../selection';
import { clampRotation, mod360, type Enum } from '../util';
import { vecProject } from '../vector';
import { createControlPointManager, type ControlledObjectStateBase } from './ControlPoint';
import {
    CONTROL_POINT_BORDER_COLOR,
    CONTROL_POINT_BORDER_OUTSET,
    HandleStyle,
    ModifierKeyBehavior,
    ROTATE_HANDLE_OFFSET,
    ROTATE_SNAP_DIVISION,
    ROTATE_SNAP_TOLERANCE,
    shouldApplyModifier,
    type EventWithModifierKeys,
    type HandleFuncProps,
} from './controlpoints';
import { DraggableObject } from './DraggableObject';
import { useShowResizer } from './highlight';

const DEFAULT_MIN_SIZE = 20;

export interface ExtendedResizableObjectState extends ResizableObjectState {
    isDragging: boolean;
    isResizing: boolean;
}

export interface ResizerProps {
    object: ResizeableObject & UnknownObject;
    transformationProps?: Partial<ResizerControlPointProps>;
    children: (state: ExtendedResizableObjectState) => React.ReactElement;
    onTransformEnd?: (state: ResizableObjectState) => void;
}

export interface ResizerControlPointProps {
    minSize: number;
    keepRatioBehavior: ModifierKeyBehavior;
    centerScalingBehavior: ModifierKeyBehavior;
}

const HandleId = {
    Rotate: 0,
    Top: 1,
    TopRight: 2,
    Right: 3,
    BottomRight: 4,
    Bottom: 5,
    BottomLeft: 6,
    Left: 7,
    TopLeft: 8,
} as const;
type HandleId = Enum<typeof HandleId>;

const HORIZONTAL_EDGE_HANDLES = new Set<HandleId>([HandleId.Left, HandleId.Right]);
const VERTICAL_EDGE_HANDLES = new Set<HandleId>([HandleId.Top, HandleId.Bottom]);
const CORNER_HANDLES = new Set<HandleId>([
    HandleId.TopRight,
    HandleId.BottomRight,
    HandleId.BottomLeft,
    HandleId.TopLeft,
]);

interface ResizableObjectState extends ControlledObjectStateBase {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    rotation: number;
}

function getRotation(
    scene: Readonly<Scene>,
    object: ResizeableObject,
    { pointerPos, activeHandleId }: HandleFuncProps,
) {
    if (pointerPos && activeHandleId === HandleId.Rotate) {
        const angle = getPointerAngle(pointerPos);
        const baseRotation = getBaseFacingRotation(scene, object);
        return snapAngle(angle - baseRotation, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE) + baseRotation;
    }

    return getAbsoluteRotation(scene, object);
}

interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

function shouldUseCenterScaling(
    modifierKeys: EventWithModifierKeys | undefined,
    props: ResizerControlPointProps,
): boolean {
    return shouldApplyModifier(modifierKeys?.ctrlKey, props.centerScalingBehavior);
}

function shouldKeepRatio(modifierKeys: EventWithModifierKeys | undefined, props: ResizerControlPointProps): boolean {
    return shouldApplyModifier(modifierKeys?.shiftKey, props.keepRatioBehavior);
}

function getShape(
    scene: Readonly<Scene>,
    object: ResizeableObject,
    { pointerPos, activeHandleId, modifierKeys }: HandleFuncProps,
    controlPointProps: ResizerControlPointProps,
): Rectangle {
    if (activeHandleId === undefined || pointerPos === undefined || activeHandleId === HandleId.Rotate) {
        return { x: object.x, y: object.y, width: object.width, height: object.height };
    }
    const keepRatio = shouldKeepRatio(modifierKeys, controlPointProps);
    const centerScaling = shouldUseCenterScaling(modifierKeys, controlPointProps);

    const absolutePos = getAbsolutePosition(scene, object);
    const rotation = getAbsoluteRotation(scene, object);
    // do calculations in space relative to the object
    let unrotatedPointerPos = rotateCoord(pointerPos, -rotation);
    const allowHorizontalScale = !VERTICAL_EDGE_HANDLES.has(activeHandleId as HandleId);
    const allowVerticalScale = !HORIZONTAL_EDGE_HANDLES.has(activeHandleId as HandleId);
    const isCornerHandle = CORNER_HANDLES.has(activeHandleId as HandleId);

    // Which point of the object is staying fixed on-screen (relative to the object position, with rotation=0)
    let scaleOrigin: Vector2d;
    // how much to multiply the scaleOrigin -> pointerPos vector by to get the new width & height
    let scale: number;

    if (centerScaling) {
        scaleOrigin = { x: 0, y: 0 };
        // new width & height = 2x diff from origin
        scale = 2;
    } else {
        // default: resize from opposite control point
        scaleOrigin = getHandlePosition(object, getOppositeHandle(activeHandleId as HandleId));
        // new width & height = 1x diff from origin
        scale = 1;
    }

    const handlePositionRatio = getHandlePositionRatio(activeHandleId as HandleId);

    // If the ratio is supposed to be fixed, project the pointer position onto the associated diagonal for
    // corner handles.
    if (keepRatio && isCornerHandle) {
        unrotatedPointerPos = vecProject(unrotatedPointerPos, getHandlePosition(object, activeHandleId as HandleId));
    }

    // This can have negative values; it is the width and height interpreted from the scaling origin, where
    // "towards the original location of the active handle" is considered the "positive" direction.
    // (it'll be negative when dragging the handle past an opposite edge)
    const newSize = {
        width: allowHorizontalScale
            ? (unrotatedPointerPos.x - scaleOrigin.x) * scale * Math.sign(handlePositionRatio.x)
            : object.width,
        height: allowVerticalScale
            ? (unrotatedPointerPos.y - scaleOrigin.y) * scale * Math.sign(handlePositionRatio.y)
            : object.height,
    };
    if (Math.abs(newSize.width) < controlPointProps.minSize) {
        newSize.width = controlPointProps.minSize * Math.sign(newSize.width);
    }
    if (Math.abs(newSize.height) < controlPointProps.minSize) {
        newSize.height = controlPointProps.minSize * Math.sign(newSize.height);
    }
    if (keepRatio) {
        const originalRatio = object.width / object.height;
        // if using this on an edge handle, always adjust the other dimension so the handle
        // (or at least the edge) stays under the cursor.
        // Corner handles are handled above, by projecting the pointer onto the diagonal.
        if (!allowHorizontalScale) {
            newSize.width = originalRatio * Math.abs(newSize.height) * Math.sign(newSize.width);
        } else if (!allowVerticalScale) {
            newSize.height = (Math.abs(newSize.width) / originalRatio) * Math.sign(newSize.height);
        }
        // re-apply minimum sizes since the aspect ratio may have caused one of the dimensions to have grown too small
        if (Math.abs(newSize.width) <= controlPointProps.minSize) {
            newSize.width = controlPointProps.minSize * Math.sign(newSize.width);
            newSize.height = Math.abs(newSize.width / originalRatio) * Math.sign(newSize.height);
        } else if (Math.abs(newSize.height) <= controlPointProps.minSize) {
            newSize.height = controlPointProps.minSize * Math.sign(newSize.height);
            newSize.width = Math.abs(newSize.height * originalRatio) * Math.sign(newSize.width);
        }
    }

    let newPosition;
    if (centerScaling) {
        newPosition = { ...absolutePos };
    } else {
        // Rotate the final new position back to the actual orientation
        const relativeNewPos = rotateCoord(
            {
                x: scaleOrigin.x + handlePositionRatio.x * newSize.width,
                y: scaleOrigin.y + handlePositionRatio.y * newSize.height,
            },
            rotation,
        );
        newPosition = {
            x: absolutePos.x + relativeNewPos.x,
            y: absolutePos.y + relativeNewPos.y,
        };
    }
    return { ...newPosition, width: Math.abs(newSize.width), height: Math.abs(newSize.height) };
}

/** Calculates the position of the handles relative to the center of the given rectangle. */
function getHandlePosition(rect: Rectangle, handle: HandleId, forKonvaCoords?: boolean): Vector2d {
    const ratio = getHandlePositionRatio(handle);
    const pos = { x: ratio.x * rect.width, y: ratio.y * rect.height };
    if (handle == HandleId.Rotate) {
        pos.y += ROTATE_HANDLE_OFFSET;
    }
    // The Y axis is flipped when handling Konva objects directly
    if (forKonvaCoords) {
        return { x: pos.x, y: -pos.y };
    } else {
        return pos;
    }
}

/**
 * Determines where each handle is (or is attached), relative to the center of a rectangle,
 * as a ratio of the total width and height
 */
function getHandlePositionRatio(handle: HandleId): { x: number; y: number } {
    switch (handle) {
        case HandleId.Top:
        case HandleId.Rotate:
            // (rotate handle offset is handled separately)
            return { x: 0, y: 0.5 };
        case HandleId.TopRight:
            return { x: 0.5, y: 0.5 };
        case HandleId.Right:
            return { x: 0.5, y: 0 };
        case HandleId.BottomRight:
            return { x: 0.5, y: -0.5 };
        case HandleId.Bottom:
            return { x: 0, y: -0.5 };
        case HandleId.BottomLeft:
            return { x: -0.5, y: -0.5 };
        case HandleId.Left:
            return { x: -0.5, y: 0 };
        case HandleId.TopLeft:
            return { x: -0.5, y: 0.5 };
    }
}

function getOppositeHandle(handle: HandleId): HandleId {
    switch (handle) {
        case HandleId.Top:
            return HandleId.Bottom;
        case HandleId.TopRight:
            return HandleId.BottomLeft;
        case HandleId.Right:
            return HandleId.Left;
        case HandleId.BottomRight:
            return HandleId.TopLeft;
        case HandleId.Bottom:
            return HandleId.Top;
        case HandleId.BottomLeft:
            return HandleId.TopRight;
        case HandleId.Left:
            return HandleId.Right;
        case HandleId.TopLeft:
            return HandleId.BottomRight;
    }
    throw new Error('non-edge handles do not have opposites');
}

const ResizerControlPoints = createControlPointManager<
    ResizeableObject,
    ResizableObjectState,
    ResizerControlPointProps
>({
    handleFunc: (scene, object, handleProps, unusedProps, state) => {
        const rotation = getAbsoluteRotation(scene, object);
        return [
            {
                id: HandleId.Top,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation),
                ...getHandlePosition(state, HandleId.Top, true),
            },
            {
                id: HandleId.TopRight,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation + 45),
                ...getHandlePosition(state, HandleId.TopRight, true),
            },
            {
                id: HandleId.Right,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation + 90),
                ...getHandlePosition(state, HandleId.Right, true),
            },
            {
                id: HandleId.BottomRight,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation + 135),
                ...getHandlePosition(state, HandleId.BottomRight, true),
            },
            {
                id: HandleId.Bottom,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation + 180),
                ...getHandlePosition(state, HandleId.Bottom, true),
            },
            {
                id: HandleId.BottomLeft,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation + 225),
                ...getHandlePosition(state, HandleId.BottomLeft, true),
            },
            {
                id: HandleId.Left,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation + 270),
                ...getHandlePosition(state, HandleId.Left, true),
            },
            {
                id: HandleId.TopLeft,
                style: HandleStyle.Square,
                cursor: getResizeCursor(rotation + 315),
                ...getHandlePosition(state, HandleId.TopLeft, true),
            },
            {
                id: HandleId.Rotate,
                style: HandleStyle.Square,
                cursor: 'crosshair',
                ...getHandlePosition(state, HandleId.Rotate, true),
            },
        ];
    },
    stateFunc: (scene, object, handleProps, props) => {
        return { rotation: getRotation(scene, object, handleProps), ...getShape(scene, object, handleProps, props) };
    },
    getRotation: getRotation,
    onRenderBorder: (object, state) => {
        return (
            <>
                <Line
                    points={[0, -state.height / 2, 0, -state.height / 2 - ROTATE_HANDLE_OFFSET]}
                    stroke={CONTROL_POINT_BORDER_COLOR}
                    strokeWidth={1}
                />
                <Rect
                    width={state.width + CONTROL_POINT_BORDER_OUTSET}
                    height={state.height + CONTROL_POINT_BORDER_OUTSET}
                    stroke={CONTROL_POINT_BORDER_COLOR}
                    offsetX={state.width / 2 + CONTROL_POINT_BORDER_OUTSET / 2}
                    offsetY={state.height / 2 + CONTROL_POINT_BORDER_OUTSET / 2}
                    strokeWidth={1}
                    fillEnabled={false}
                />
            </>
        );
    },
});

function stateChanged(object: ResizeableObject, state: ResizableObjectState) {
    if (state.x !== object.x || state.y !== object.y) {
        return true;
    }

    if (state.width !== object.width || state.height !== object.height) {
        return true;
    }

    if (mod360(state.rotation) !== mod360(object.rotation)) {
        return true;
    }

    return false;
}

export const Resizer: React.FC<ResizerProps> = ({ object, transformationProps, children, onTransformEnd }) => {
    const { dispatch, scene } = useScene();
    const showResizer = useShowResizer(object);
    const [isResizing, setIsResizing] = useState(false);
    const isDragging = useIsDragging(object);

    const updateObject = (state: ResizableObjectState) => {
        const baseRotation = getBaseFacingRotation(scene, object);
        state.rotation = clampRotation(state.rotation - baseRotation);

        if (!stateChanged(object, state)) {
            return;
        }

        dispatch({ type: 'update', value: { ...object, ...state } as SceneObject });
        onTransformEnd?.(state);
    };

    return (
        <ActivePortal isActive={isDragging || isResizing}>
            <DraggableObject object={object}>
                <ResizerControlPoints
                    object={object}
                    onActive={setIsResizing}
                    visible={showResizer && !isDragging}
                    onTransformEnd={updateObject}
                    minSize={transformationProps?.minSize ?? DEFAULT_MIN_SIZE}
                    keepRatioBehavior={transformationProps?.keepRatioBehavior ?? ModifierKeyBehavior.Default}
                    centerScalingBehavior={transformationProps?.centerScalingBehavior ?? ModifierKeyBehavior.Default}
                >
                    {(state) => children({ ...state, isDragging, isResizing })}
                </ResizerControlPoints>
            </DraggableObject>
        </ActivePortal>
    );
};
