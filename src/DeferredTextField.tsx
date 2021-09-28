import { ITextFieldProps, TextField } from '@fluentui/react';
import React, { FocusEventHandler, KeyboardEventHandler, useCallback, useEffect, useState } from 'react';

type ChangeHandler = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
type KeyHandler = KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
type FocusHandler = FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;

export interface DeferredTextFieldProps extends Omit<ITextFieldProps, 'onChange'> {
    onChange?: (newValue: string | undefined) => void;
}

/**
 * Wrapper for TextField that defers the onChange event until the state is done
 * being changed.
 */
export const DeferredTextField: React.FC<DeferredTextFieldProps> = ({ value, onChange, ...props }) => {
    const [text, setText] = useState(value);

    useEffect(() => {
        if (text !== value) {
            setText(value);
        }
    }, [value, setText]);

    const deferOnChange = useCallback<ChangeHandler>((ev, newValue) => setText(newValue), [setText]);

    const onKeyPress = useCallback<KeyHandler>(
        (ev) => {
            if (ev.key === 'Enter' && text !== value) {
                onChange?.(text);
            }
        },
        [onChange, text, value],
    );

    const onBlur = useCallback<FocusHandler>(() => {
        if (text !== value) {
            onChange?.(text);
        }
    }, [onChange, text, value]);

    // TODO: also change with debounce?

    return <TextField value={text} onChange={deferOnChange} onKeyPress={onKeyPress} onBlur={onBlur} {...props} />;
};
