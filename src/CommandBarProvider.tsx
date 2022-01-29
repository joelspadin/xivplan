import React, { createContext, Dispatch, ReactNode, useContext, useEffect, useState } from 'react';

type CommandBarState = [ReactNode, Dispatch<ReactNode>];

export const CommandBarContext = createContext<CommandBarState>([null, () => undefined]);

export const CommandBarProvider: React.FC = ({ children }) => {
    const state = useState<ReactNode>(null);

    return <CommandBarContext.Provider value={state}>{children}</CommandBarContext.Provider>;
};

export function useCommandBar(element: ReactNode, deps: React.DependencyList): void {
    const [, dispatch] = useContext(CommandBarContext);

    useEffect(() => {
        dispatch(element);

        return () => dispatch(null);
    }, deps);
}
