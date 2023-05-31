import React, { ReactNode, useContext, useEffect } from 'react';
import { CommandBarContext } from './CommandBarProvider';

export function useCommandBar(element: ReactNode, deps: React.DependencyList): void {
    const [, dispatch] = useContext(CommandBarContext);

    useEffect(() => {
        dispatch(element);

        return () => dispatch(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, ...deps]);
}
