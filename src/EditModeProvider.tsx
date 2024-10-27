import React, { PropsWithChildren, useState } from 'react';
import { EditMode } from './editMode';
import {
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

    return (
        <EditModeContext.Provider value={editMode}>
            <DrawConfigContext.Provider value={drawConfig}>
                <TetherConfigContext.Provider value={tetherConfig}>{children}</TetherConfigContext.Provider>
            </DrawConfigContext.Provider>
        </EditModeContext.Provider>
    );
};
