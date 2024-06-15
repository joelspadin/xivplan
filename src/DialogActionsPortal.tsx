import { DialogActions } from '@fluentui/react-components';
import React, { Dispatch, ReactNode, createContext, useContext, useState } from 'react';

export type DialogActionsPortalState = [ReactNode, Dispatch<ReactNode>];

export const DialogActionsPortalContext = createContext<DialogActionsPortalState>([null, () => undefined]);

export interface DialogActionsPortalProviderProps {
    children?: ReactNode | undefined;
}

export const DialogActionsPortalProvider: React.FC<DialogActionsPortalProviderProps> = ({ children }) => {
    const state = useState<ReactNode>(null);

    return <DialogActionsPortalContext.Provider value={state}>{children}</DialogActionsPortalContext.Provider>;
};

export const DialogActionsPortal: React.FC = () => {
    const [children] = useContext(DialogActionsPortalContext);

    return <DialogActions>{children}</DialogActions>;
};
