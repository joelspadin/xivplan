import React, { createContext, Dispatch, PropsWithChildren, SetStateAction, useState } from 'react';

export type DefaultCursorState = [string, Dispatch<SetStateAction<string>>];

export const DefaultCursorContext = createContext<DefaultCursorState>(['default', () => undefined]);

export const DefaultCursorProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const state = useState('default');

    return <DefaultCursorContext.Provider value={state}>{children}</DefaultCursorContext.Provider>;
};
