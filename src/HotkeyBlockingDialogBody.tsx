import { DialogBody, DialogBodyProps } from '@fluentui/react-components';
import React from 'react';
import { useHotkeyBlocker } from './useHotkeys';

/**
 * DialogBody, but hotkeys registered with useHotkeys are disabled while it is open.
 */
export const HotkeyBlockingDialogBody: React.FC<DialogBodyProps> = (props) => {
    useHotkeyBlocker();

    return <DialogBody {...props} />;
};
