import type { Vector2d } from 'konva/lib/types';
import type { Enum } from '../util';

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

export const SQUARE_FILL_COLOR = '#ffffff';
export const SQUARE_STROKE_COLOR = CONTROL_POINT_BORDER_COLOR;
export const DIAMOND_FILL_COLOR = '#fafa00';
export const DIAMOND_STROKE_COLOR = '#adad00';

export const CONTROL_POINT_SIZE = 10;
export const CONTROL_POINT_OFFSET = { x: CONTROL_POINT_SIZE / 2, y: CONTROL_POINT_SIZE / 2 };

export const ROTATE_HANDLE_OFFSET = 50;
export const ROTATE_SNAP_DIVISION = 15;
export const ROTATE_SNAP_TOLERANCE = 2;
