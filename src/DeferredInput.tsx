import { Input, InputProps } from '@fluentui/react-components';
import React from 'react';

export interface DeferredInputProps extends InputProps {
    onCommit?: () => void;
}

type BlurHandler = Required<DeferredInputProps>['onBlur'];
type KeyUpHandler = Required<DeferredInputProps>['onKeyUp'];

/**
 * Wrapper for Input that fires an onCommit event when the user presses enter or
 * the input loses focus.
 */
export const DeferredInput: React.FC<DeferredInputProps> = ({ value, onBlur, onKeyUp, onCommit, ...props }) => {
    const handleBlur: BlurHandler = (ev) => {
        onBlur?.(ev);
        onCommit?.();
    };

    const handleKeyUp: KeyUpHandler = (ev) => {
        onKeyUp?.(ev);

        if (ev.key === 'Enter') {
            onCommit?.();
        }
    };

    return <Input value={value ?? ''} onBlur={handleBlur} onKeyUp={handleKeyUp} {...props} />;
};
