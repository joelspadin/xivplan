import { IModalProps, IStyleFunctionOrObject, Theme } from '@fluentui/react';
import React from 'react';
import { BaseDialog, IBaseDialogStyles } from '../BaseDialog';

export const ShareDialog: React.FC<IModalProps> = (props) => {
    return (
        <BaseDialog headerText="Share" {...props} dialogStyles={dialogStyles}>
            <p>TODO</p>
        </BaseDialog>
    );
};

const dialogStyles: IStyleFunctionOrObject<Theme, IBaseDialogStyles> = {
    body: {
        maxWidth: '70ch',
    },
};
