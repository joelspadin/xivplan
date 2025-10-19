import { Textarea, TextareaProps } from '@fluentui/react-components';
import React from 'react';

export interface DeferredTextareaProps extends TextareaProps {
    onCommit?: () => void;
}

type BlurHandler = Required<DeferredTextareaProps>['onBlur'];

/**
 * Wrapper for Textarea that fires an onCommit event when the user presses enter or
 * the input loses focus.
 */
export const DeferredTextarea: React.FC<DeferredTextareaProps> = ({ value, onBlur, onCommit, ...props }) => {
    const handleBlur: BlurHandler = (ev) => {
        onBlur?.(ev);
        onCommit?.();
        console.log('blur');
    };

    return <Textarea value={value ?? ''} onBlur={handleBlur} {...props} />;
};
