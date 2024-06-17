import { ReactNode, useContext, useEffect } from 'react';
import { DialogActionsPortalContext } from './DialogActionsPortal';

/**
 * Renders the given node into a <DialogActionsPortal> element in the parent dialog.
 *
 * The parent must be wrapped in a <DialogActionsPortalProvider>.
 */
export function useDialogActions(element: ReactNode): void {
    const [, dispatch] = useContext(DialogActionsPortalContext);

    useEffect(() => {
        dispatch(element);

        return () => dispatch(null);
    }, [dispatch, element]);
}
