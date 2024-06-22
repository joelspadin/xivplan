import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
} from '@fluentui/react-components';
import React, { useId } from 'react';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { useAsyncModalResolveCallback } from '../useAsyncModal';
import { FilePromptProps } from './FilePrompts';

export const UnsavedChangesPrompt: React.FC<FilePromptProps> = ({ resolve, ...props }) => {
    const confirmId = useId();
    const onOpenChange = useAsyncModalResolveCallback(confirmId, resolve);

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogSurface>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>Unsaved changes</DialogTitle>
                    <DialogContent>
                        Are you sure you want to open a file? Your unsaved changes will be lost.
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                Open anyways
                            </Button>
                        </DialogTrigger>
                        <DialogTrigger>
                            <Button>Cancel</Button>
                        </DialogTrigger>
                    </DialogActions>
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
    );
};
