import React, { PropsWithChildren, useState } from 'react';
import { PanelDragContext, PanelDragObject } from './PanelDragContext';

export const PanelDragProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const state = useState<PanelDragObject | null>(null);

    return <PanelDragContext.Provider value={state}>{children}</PanelDragContext.Provider>;
};
