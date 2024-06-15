import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
} from '@fluentui/react-components';
import React, { useId } from 'react';
import { useAsyncModalResolveCallback } from '../useAsyncModal';
import { FilePromptProps } from './FilePrompts';

export const UnsavedChangesPrompt: React.FC<FilePromptProps> = ({ resolve, ...props }) => {
    const confirmId = useId();
    const onOpenChange = useAsyncModalResolveCallback(confirmId, resolve);

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogSurface>
                <DialogBody>
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
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
