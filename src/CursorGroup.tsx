import Konva from 'konva';
import React from 'react';
import { Group, KonvaNodeEvents } from 'react-konva';
import { useDefaultCursor } from './cursor';
import { useStage } from './render/stage';

export interface CursorGroupProps extends Konva.NodeConfig, KonvaNodeEvents {
    cursor?: string;
}

export const CursorGroup: React.FC<CursorGroupProps> = ({ cursor, children, ...props }) => {
    const [defaultCursor] = useDefaultCursor();
    const stage = useStage();

    const setCursor = (cursor?: string) => {
        if (stage && cursor) {
            stage.container().style.cursor = cursor;
        }
    };

    return (
        <Group onMouseEnter={() => setCursor(cursor)} onMouseLeave={() => setCursor(defaultCursor)} {...props}>
            {children}
        </Group>
    );
};
