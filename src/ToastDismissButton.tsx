import { createFocusOutlineStyle, makeResetStyles, ToastTrigger, tokens } from '@fluentui/react-components';
import { Dismiss20Regular } from '@fluentui/react-icons';
import React from 'react';

export const ToastDismissButton: React.FC = () => {
    const dismissButtonStyles = useDismissButtonStyles();

    return (
        <ToastTrigger>
            <button type="button" aria-label="close" className={dismissButtonStyles}>
                <Dismiss20Regular />
            </button>
        </ToastTrigger>
    );
};

const useDismissButtonStyles = makeResetStyles({
    ...createFocusOutlineStyle(),
    color: tokens.colorNeutralForeground1,
    overflow: 'visible',
    padding: 0,
    borderStyle: 'none',
    position: 'relative',
    boxSizing: 'content-box',
    backgroundColor: 'inherit',

    fontFamily: 'inherit',
    fontSize: 'inherit',
    cursor: 'pointer',
    lineHeight: 0,
    WebkitAppearance: 'button',
    textAlign: 'unset',
});
