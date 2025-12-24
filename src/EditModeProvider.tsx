import React, { PropsWithChildren, useState } from 'react';
import { EditMode } from './editMode';
import {
    ConnectionSelectionConfig,
    ConnectionSelectionContext,
    DEFAULT_CONNECTION_SELECTION_CONFIG,
    DEFAULT_DRAW_CONFIG,
    DEFAULT_TETHER_CONFIG,
    DrawConfig,
    DrawConfigContext,
    EditModeContext,
    TetherConfig,
    TetherConfigContext,
} from './EditModeContext';

export const EditModeProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const editMode = useState<EditMode>(EditMode.Normal);
    const drawConfig = useState<DrawConfig>(DEFAULT_DRAW_CONFIG);
    const tetherConfig = useState<TetherConfig>(DEFAULT_TETHER_CONFIG);
    const connectionConfig = useState<ConnectionSelectionConfig>(DEFAULT_CONNECTION_SELECTION_CONFIG);

    return (
        <EditModeContext value={editMode}>
            <ConnectionSelectionContext value={connectionConfig}>
                <DrawConfigContext value={drawConfig}>
                    <TetherConfigContext value={tetherConfig}>{children}</TetherConfigContext>
                </DrawConfigContext>
            </ConnectionSelectionContext>
        </EditModeContext>
    );
};
