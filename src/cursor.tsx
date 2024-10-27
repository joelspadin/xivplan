import { useContext } from 'react';
import { DefaultCursorContext, DefaultCursorState } from './DefaultCursorContext';
import { mod360 } from './util';

export function getResizeCursor(angle: number): string {
    angle = mod360(angle) - 22.5;

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

export function useDefaultCursor(): DefaultCursorState {
    return useContext(DefaultCursorContext);
}
