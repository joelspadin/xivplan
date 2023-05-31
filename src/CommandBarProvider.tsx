import React, { createContext, Dispatch, PropsWithChildren, ReactNode, useState } from 'react';

type CommandBarState = [ReactNode, Dispatch<ReactNode>];

export const CommandBarContext = createContext<CommandBarState>([null, () => undefined]);

export const CommandBarProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const state = useState<ReactNode>(null);

    return <CommandBarContext.Provider value={state}>{children}</CommandBarContext.Provider>;
};
