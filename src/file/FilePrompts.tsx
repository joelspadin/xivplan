import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogProps,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
} from '@fluentui/react-components';
import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
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
    const { t } = useTranslation();

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogSurface>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>
                        {t('FilePrompts.Overwrite')} {filename}
                    </DialogTitle>
                    <DialogContent>{t('translation.FilePrompts.Overwrite_Description')}</DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                {t('FilePrompts.Overwrite')}
                            </Button>
                        </DialogTrigger>
                        <DialogTrigger>
                            <Button>{t('FilePrompts.Cancel')}</Button>
                        </DialogTrigger>
                    </DialogActions>
                </HotkeyBlockingDialogBody>
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
    const { t } = useTranslation();

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogSurface>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>
                        {t('FilePrompts.Delete')} {filename}
                    </DialogTitle>
                    <DialogContent>{t('FilePrompts.Delete_Description')}</DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                {t('FilePrompts.Delete')}
                            </Button>
                        </DialogTrigger>
                        <DialogTrigger>
                            <Button>{t('FilePrompts.Cancel')}</Button>
                        </DialogTrigger>
                    </DialogActions>
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
    );
};
