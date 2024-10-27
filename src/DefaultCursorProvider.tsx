import { PropsWithChildren, useState } from 'react';
import { DefaultCursorContext } from './DefaultCursorContext';

export const DefaultCursorProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const state = useState('default');

    return <DefaultCursorContext.Provider value={state}>{children}</DefaultCursorContext.Provider>;
};
