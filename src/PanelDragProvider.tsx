import React, { type PropsWithChildren, useState } from 'react';
import { PanelDragContext, type PanelDragObject } from './PanelDragContext';

export const PanelDragProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const state = useState<PanelDragObject | null>(null);

    return <PanelDragContext value={state}>{children}</PanelDragContext>;
};
