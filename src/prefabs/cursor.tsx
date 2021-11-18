import Konva from 'konva';
import React, { useCallback } from 'react';
import { Group, KonvaNodeEvents } from 'react-konva';
import { useStage } from '../render/StageProvider';
import { mod360 } from '../util';

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

export interface CursorGroupProps extends Konva.NodeConfig, KonvaNodeEvents {
    cursor: string;
}

export const CursorGroup: React.FC<CursorGroupProps> = ({ cursor, children, ...props }) => {
    const stage = useStage();

    const setCursor = useCallback(
        (cursor: string) => {
            if (stage) {
                stage.container().style.cursor = cursor;
            }
        },
        [stage],
    );

    return (
        <Group onMouseEnter={() => setCursor(cursor)} onMouseLeave={() => setCursor('default')} {...props}>
            {children}
        </Group>
    );
};
