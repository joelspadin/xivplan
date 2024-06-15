import { useDialogContext_unstable } from '@fluentui/react-components';
import { MouseEvent, useCallback } from 'react';

export function useDismissDialog() {
    // TODO: is there a better way to do this?
    const requestOpenChange = useDialogContext_unstable((ctx) => ctx.requestOpenChange);

    const dismissDialog = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            requestOpenChange({ type: 'triggerClick', open: false, event });
        },
        [requestOpenChange],
    );

    return dismissDialog;
}
