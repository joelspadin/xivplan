import {
    DefaultButton,
    Dialog,
    DialogFooter,
    DialogType,
    IDialogContentProps,
    IDialogContentStyles,
    IDialogProps,
    PrimaryButton,
} from '@fluentui/react';
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

interface DeleteFilePromptProps extends FilePromptProps {
    filename: string;
}

const deleteContentStyles: Partial<IDialogContentStyles> = {
    title: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};

export const DeleteFilePrompt: React.FC<DeleteFilePromptProps> = ({ onCancel, onConfirm, filename, ...props }) => {
    const deleteContent: IDialogContentProps = {
        type: DialogType.normal,
        title: `Delete ${filename}`,
        subText: `Are you sure you want to delete this file?`,
        styles: deleteContentStyles,
    };

    return (
        <Dialog dialogContentProps={deleteContent} onDismiss={onCancel} {...props}>
            <DialogFooter>
                <PrimaryButton text="Delete" onClick={onConfirm} />
                <DefaultButton text="Cancel" onClick={onCancel} />
            </DialogFooter>
        </Dialog>
    );
};
