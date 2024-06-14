import React, { createContext, Dispatch, PropsWithChildren, ReactNode, useState } from 'react';

type ToolbarState = [ReactNode, Dispatch<ReactNode>];

export const ToolbarContext = createContext<ToolbarState>([null, () => undefined]);

export const ToolbarProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const state = useState<ReactNode>(null);

    return <ToolbarContext.Provider value={state}>{children}</ToolbarContext.Provider>;
};
