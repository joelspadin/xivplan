import { Theme, ThemeProvider } from '@fluentui/react';
import reactModal from '@prezly/react-promise-modal';
import React from 'react';
import { DeleteFilePrompt, OverwriteFilePrompt, UnsavedChangesPrompt } from './FilePrompts';

export async function confirmUnsavedChanges(theme?: Theme): Promise<boolean | undefined> {
    return await reactModal(({ show, onSubmit, onDismiss }) => {
        return (
            <ThemeProvider theme={theme}>
                <UnsavedChangesPrompt hidden={!show} onConfirm={onSubmit} onCancel={onDismiss} />
            </ThemeProvider>
        );
    });
}

export async function confirmOverwriteFile(theme?: Theme): Promise<boolean | undefined> {
    return await reactModal(({ show, onSubmit, onDismiss }) => {
        return (
            <ThemeProvider theme={theme}>
                <OverwriteFilePrompt hidden={!show} onConfirm={onSubmit} onCancel={onDismiss} />
            </ThemeProvider>
        );
    });
}

export async function confirmDeleteFile(filename: string, theme?: Theme): Promise<boolean | undefined> {
    return await reactModal(({ show, onSubmit, onDismiss }) => {
        return (
            <ThemeProvider theme={theme}>
                <DeleteFilePrompt hidden={!show} onConfirm={onSubmit} onCancel={onDismiss} filename={filename} />
            </ThemeProvider>
        );
    });
}
