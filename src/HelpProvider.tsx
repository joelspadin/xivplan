import { IUseBooleanCallbacks, useBoolean } from '@fluentui/react-hooks';
import React, { PropsWithChildren, createContext } from 'react';

export type HelpState = [boolean, IUseBooleanCallbacks];

export const HelpContext = createContext<HelpState>([
    false,
    { setFalse: () => undefined, setTrue: () => undefined, toggle: () => undefined },
]);

export const HelpProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const context = useBoolean(false);

    return <HelpContext.Provider value={context}>{children}</HelpContext.Provider>;
};
