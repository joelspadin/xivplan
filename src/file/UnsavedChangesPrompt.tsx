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
import { useTranslation } from 'react-i18next';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { useAsyncModalResolveCallback } from '../useAsyncModal';
import { FilePromptProps } from './FilePrompts';

export const UnsavedChangesPrompt: React.FC<FilePromptProps> = ({ resolve, ...props }) => {
    const confirmId = useId();
    const onOpenChange = useAsyncModalResolveCallback(confirmId, resolve);
    const { t } = useTranslation();

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            <DialogSurface>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>{t('UnsavedChangesPrompt.UnsavedChanges')}</DialogTitle>
                    <DialogContent>{t('UnsavedChangesPrompt.UnsavedChangesContent')}</DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                {t('UnsavedChangesPrompt.OpenAnyways')}
                            </Button>
                        </DialogTrigger>
                        <DialogTrigger>
                            <Button>{t('UnsavedChangesPrompt.Cancel')}</Button>
                        </DialogTrigger>
                    </DialogActions>
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
    );
};
