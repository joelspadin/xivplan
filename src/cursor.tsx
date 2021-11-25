import Konva from 'konva';
import React, { createContext, Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';
import { Group, KonvaNodeEvents } from 'react-konva';
import { useStage } from './render/StageProvider';
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

export type DefaultCursorState = [string, Dispatch<SetStateAction<string>>];

export const DefaultCursorContext = createContext<DefaultCursorState>(['default', () => undefined]);

export const DefaultCursorProvider: React.FC = ({ children }) => {
    const state = useState('default');

    return <DefaultCursorContext.Provider value={state}>{children}</DefaultCursorContext.Provider>;
};

export function useDefaultCursor(): DefaultCursorState {
    return useContext(DefaultCursorContext);
}

export interface CursorGroupProps extends Konva.NodeConfig, KonvaNodeEvents {
    cursor?: string;
}

export const CursorGroup: React.FC<CursorGroupProps> = ({ cursor, children, ...props }) => {
    const [defaultCursor] = useDefaultCursor();
    const stage = useStage();

    const setCursor = useCallback(
        (cursor?: string) => {
            if (stage && cursor) {
                stage.container().style.cursor = cursor;
            }
        },
        [stage],
    );

    return (
        <Group onMouseEnter={() => setCursor(cursor)} onMouseLeave={() => setCursor(defaultCursor)} {...props}>
            {children}
        </Group>
    );
};
