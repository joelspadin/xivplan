import { Text, Toast, ToastBody, ToastProps, ToastTitle } from '@fluentui/react-components';
import React from 'react';
import { ToastDismissButton } from './ToastDismissButton';

export interface MessageToastProps extends ToastProps {
    title: string;
    message: string | Error | unknown;
}

export const MessageToast: React.FC<MessageToastProps> = ({ title, message, ...props }) => {
    const messageStr = typeof message === 'string' ? message : message instanceof Error ? message.message : undefined;

    return (
        <Toast {...props}>
            <ToastTitle action={<ToastDismissButton />}>{title}</ToastTitle>
            <ToastBody>
                <Text>{messageStr}</Text>
            </ToastBody>
        </Toast>
    );
};
