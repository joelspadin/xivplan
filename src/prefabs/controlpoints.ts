import type { Vector2d } from 'konva/lib/types';
import { getAbsoluteRotation, getBaseFacingRotation, getPointerAngle, snapAngle } from '../coord';
import type { MoveableObject, RotateableObject, Scene } from '../scene';
import { clamp, mod360, type Enum } from '../util';
import { MAX_CONE_ANGLE, MIN_CONE_ANGLE } from './bounds';

export const CONTROL_POINT_BORDER_COLOR = '#00a1ff';
export const CONTROL_POINT_BORDER_OUTSET = 2;

export const HandleStyle = {
    Square: 0,
    Diamond: 1,
} as const;
export type HandleStyle = Enum<typeof HandleStyle>;

export interface Handle extends Vector2d {
    readonly id: number;
    readonly cursor?: string;
    readonly style?: HandleStyle;
}

export interface EventWithModifierKeys {
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
}

export const ModifierKeyBehavior = {
    Default: 'default',
    ForceDisabled: 'disabled',
    ForceEnabled: 'enabled',
    Inverted: 'inverted',
} as const;
export type ModifierKeyBehavior = Enum<typeof ModifierKeyBehavior>;

export function shouldApplyModifier(modifierKeyValue: boolean | undefined, behavior: ModifierKeyBehavior): boolean {
    switch (behavior) {
        case ModifierKeyBehavior.Default:
            return modifierKeyValue ?? false;
        case ModifierKeyBehavior.Inverted:
            return !(modifierKeyValue ?? false);
        case ModifierKeyBehavior.ForceDisabled:
            return false;
        case ModifierKeyBehavior.ForceEnabled:
            return true;
    }
}

export interface HandleFuncProps {
    pointerPos?: Vector2d;
    modifierKeys?: EventWithModifierKeys;
    activeHandleId?: number;
}

export function shouldSnapAngle(modifierKeys: EventWithModifierKeys | undefined) {
    return !modifierKeys?.altKey;
}

/**
 * Calculates the rotation based on where the mouse pointer currently is, assuming a
 * rotation-adjusting control point is being dragged AND that control point is at 0 degrees.
 * @param obj the object whose rotation is being adjusted
 * @param pointerPos the position of the mouse pointer relative to the object position
 * @param modifierKeys any active modifier keys
 */
export function getNewRotationFromPointer(
    scene: Scene,
    obj: RotateableObject & MoveableObject,
    pointerPos: Vector2d,
    modifierKeys: EventWithModifierKeys | undefined,
) {
    const angle = getPointerAngle(pointerPos);
    const baseRotation = getBaseFacingRotation(scene, obj);
    if (shouldSnapAngle(modifierKeys)) {
        return snapAngle(angle - baseRotation, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE) + baseRotation;
    } else {
        return angle;
    }
}

export const AngleHandleType = {
    /** The handle located clockwise from "up". */
    CLOCKWISE: 1,
    /** The handle located counterclockwise from "up". */
    COUNTERCLOCKWISE: -1,
};
export type AngleHandleType = Enum<typeof AngleHandleType>;

/**
 * Calculates the cone/arc angle based on where the mouse pointer currently is, assuming
 * an angle-adjusting control point is being dragged.
 * @param obj the object whose angle is being adjusted
 * @param pointerPos the position of the mouse pointer relative to the object position
 * @param modifierKeys any active modifier keys
 * @param handleType which of the two angle handles is being dragged
 */
export function getNewConeAngleFromPointer(
    scene: Scene,
    obj: RotateableObject & MoveableObject,
    pointerPos: Vector2d,
    modifierKeys: EventWithModifierKeys | undefined,
    handleType: AngleHandleType,
): number {
    const objectRotation = getAbsoluteRotation(scene, obj);
    const pointerAngle = getPointerAngle(pointerPos);
    // the first 90deg into the other handle's area should keep the angle at its minimum instead
    // of maximum, so wrap this half-angle in the range [-90, 270].
    const newHalfAngle = mod360((pointerAngle - objectRotation) * handleType + 90) - 90;
    const newAngle = shouldSnapAngle(modifierKeys)
        ? snapAngle(newHalfAngle, ROTATE_SNAP_DIVISION, ROTATE_SNAP_TOLERANCE) * 2
        : newHalfAngle * 2;
    return clamp(newAngle, MIN_CONE_ANGLE, MAX_CONE_ANGLE);
}

export const SQUARE_FILL_COLOR = '#ffffff';
export const SQUARE_STROKE_COLOR = CONTROL_POINT_BORDER_COLOR;
export const DIAMOND_FILL_COLOR = '#fafa00';
export const DIAMOND_STROKE_COLOR = '#adad00';

export const CONTROL_POINT_SIZE = 10;
export const CONTROL_POINT_OFFSET = { x: CONTROL_POINT_SIZE / 2, y: CONTROL_POINT_SIZE / 2 };

export const ROTATE_HANDLE_OFFSET = 50;
export const ROTATE_SNAP_DIVISION = 15;
export const ROTATE_SNAP_TOLERANCE = 2;
