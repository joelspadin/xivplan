import { ReactNode, useContext, useEffect } from 'react';
import { DialogActionsPortalContext } from './DialogActionsPortal';

export function useDialogActions(element: ReactNode): void {
    const [, dispatch] = useContext(DialogActionsPortalContext);

    useEffect(() => {
        dispatch(element);

        return () => dispatch(null);
    }, [dispatch, element]);
}
