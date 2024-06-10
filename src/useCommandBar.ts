import { ReactNode, useContext, useEffect } from 'react';
import { CommandBarContext } from './CommandBarProvider';

export function useCommandBar(element: ReactNode): void {
    const [, dispatch] = useContext(CommandBarContext);

    useEffect(() => {
        dispatch(element);

        return () => dispatch(null);
    }, [dispatch, element]);
}
