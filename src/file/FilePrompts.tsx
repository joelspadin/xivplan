import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogProps,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
} from '@fluentui/react-components';
import React, { useId } from 'react';
import { useAsyncModalResolveCallback } from '../useAsyncModal';

export interface FilePromptProps extends Omit<DialogProps, 'children'> {
    resolve(result: boolean): void;
}

export interface OverwriteFilePromptProps extends FilePromptProps {
    filename: string;
}

export const OverwriteFilePrompt: React.FC<OverwriteFilePromptProps> = ({ resolve, filename, ...props }) => {
    const confirmId = useId();
    const onOpenChange = useAsyncModalResolveCallback(confirmId, resolve);

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Overwrite {filename}</DialogTitle>
                    <DialogContent>A file with this name already exists. Overwrite it?</DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                Overwrite
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

export interface DeleteFilePromptProps extends FilePromptProps {
    filename: string;
}

export const DeleteFilePrompt: React.FC<DeleteFilePromptProps> = ({ resolve, filename, ...props }) => {
    const confirmId = useId();
    const onOpenChange = useAsyncModalResolveCallback(confirmId, resolve);

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Delete {filename}</DialogTitle>
                    <DialogContent>Are you sure you want to delete this file?</DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                Delete
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
