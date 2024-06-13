import { IModalProps, IStyleFunctionOrObject, Pivot, PivotItem, Theme } from '@fluentui/react';
import React from 'react';
import { BaseDialog, IBaseDialogStyles } from '../BaseDialog';
import { classNames } from './FileDialogCommon';
import { FileSystemNotSupportedMessage, OpenFileSystem, SaveFileSystem } from './FileDialogFileSystem';
import { OpenLocalStorage, SaveBrowserStorage } from './FileDialogLocalStorage';
import { ImportFromString } from './FileDialogShare';
import { supportsFs } from './filesystem';

export const OpenDialog: React.FC<IModalProps> = (props) => {
    return (
        <BaseDialog headerText="Open File" {...props} dialogStyles={dialogStyles}>
            <Pivot>
                {supportsFs && (
                    <PivotItem headerText="Local File" className={classNames.tab}>
                        <OpenFileSystem onDismiss={props.onDismiss} />
                    </PivotItem>
                )}
                <PivotItem headerText="Browser Storage" className={classNames.tab}>
                    <OpenLocalStorage onDismiss={props.onDismiss} />
                </PivotItem>
                <PivotItem headerText="Import Plan Link" className={classNames.tab}>
                    <ImportFromString onDismiss={props.onDismiss} />
                </PivotItem>
                {!supportsFs && (
                    <PivotItem headerText="Local File" className={classNames.tab}>
                        <FileSystemNotSupportedMessage />
                    </PivotItem>
                )}
            </Pivot>
        </BaseDialog>
    );
};

export const SaveAsDialog: React.FC<IModalProps> = (props) => {
    return (
        <BaseDialog headerText="Save As" {...props} dialogStyles={dialogStyles}>
            <Pivot>
                {supportsFs && (
                    <PivotItem headerText="Local File" className={classNames.tab}>
                        <SaveFileSystem onDismiss={props.onDismiss} />
                    </PivotItem>
                )}
                <PivotItem headerText="Browser Storage" className={classNames.tab}>
                    <SaveBrowserStorage onDismiss={props.onDismiss} />
                </PivotItem>
                {!supportsFs && (
                    <PivotItem headerText="Local File" className={classNames.tab}>
                        <FileSystemNotSupportedMessage />
                    </PivotItem>
                )}
            </Pivot>
        </BaseDialog>
    );
};

const dialogStyles: IStyleFunctionOrObject<Theme, IBaseDialogStyles> = {
    body: {
        minWidth: 500,
    },
};
