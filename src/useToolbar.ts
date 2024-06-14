import { ReactNode, useContext, useEffect } from 'react';
import { ToolbarContext } from './ToolbarProvider';

export function useToolbar(element: ReactNode): void {
    const [, dispatch] = useContext(ToolbarContext);

    useEffect(() => {
        dispatch(element);

        return () => dispatch(null);
    }, [dispatch, element]);
}
