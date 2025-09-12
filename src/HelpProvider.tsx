import React, { PropsWithChildren, useState } from 'react';
import { HelpContext } from './HelpContext';

export const HelpProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const context = useState(false);

    return <HelpContext value={context}>{children}</HelpContext>;
};
