import {
    DefaultButton,
    Dialog,
    DialogFooter,
    DialogType,
    IDialogContentProps,
    IDialogProps,
    PrimaryButton,
    Theme,
    ThemeProvider,
} from '@fluentui/react';
import reactModal from '@prezly/react-promise-modal';
import React from 'react';

const unsavedChangesContent: IDialogContentProps = {
    type: DialogType.normal,
    title: 'Unsaved changes',
    subText: 'Are you sure you want to open a file? Your unsaved changes will be lost.',
};

export interface FilePromptProps extends IDialogProps {
    onConfirm?: () => void;
    onCancel?: () => void;
}

export const UnsavedChangesPrompt: React.FC<FilePromptProps> = ({ onCancel, onConfirm, ...props }) => {
    return (
        <Dialog dialogContentProps={unsavedChangesContent} onDismiss={onCancel} {...props}>
            <DialogFooter>
                <PrimaryButton text="Open file" onClick={onConfirm} />
                <DefaultButton text="Cancel" onClick={onCancel} />
            </DialogFooter>
        </Dialog>
    );
};

export async function confirmUnsavedChanges(theme?: Theme): Promise<boolean | undefined> {
    return await reactModal(({ show, onSubmit, onDismiss }) => {
        return (
            <ThemeProvider theme={theme}>
                <UnsavedChangesPrompt hidden={!show} onConfirm={onSubmit} onCancel={onDismiss} />
            </ThemeProvider>
        );
    });
}

const overwriteContent: IDialogContentProps = {
    type: DialogType.normal,
    title: 'Overwrite file',
    subText: 'A file with this name already exists. Overwrite it?',
};

export const OverwriteFilePrompt: React.FC<FilePromptProps> = ({ onCancel, onConfirm, ...props }) => {
    return (
        <Dialog dialogContentProps={overwriteContent} onDismiss={onCancel} {...props}>
            <DialogFooter>
                <PrimaryButton text="Overwrite" onClick={onConfirm} />
                <DefaultButton text="Cancel" onClick={onCancel} />
            </DialogFooter>
        </Dialog>
    );
};

export async function confirmOverwriteFile(theme?: Theme): Promise<boolean | undefined> {
    return await reactModal(({ show, onSubmit, onDismiss }) => {
        return (
            <ThemeProvider theme={theme}>
                <OverwriteFilePrompt hidden={!show} onConfirm={onSubmit} onCancel={onDismiss} />
            </ThemeProvider>
        );
    });
}
