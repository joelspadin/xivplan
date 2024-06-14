import React, { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from 'react';

export type HelpState = [boolean, Dispatch<SetStateAction<boolean>>];

export const HelpContext = createContext<HelpState>([false, () => {}]);

export const HelpProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const context = useState(false);

    return <HelpContext.Provider value={context}>{children}</HelpContext.Provider>;
};
