import { ITextFieldProps, TextField } from '@fluentui/react';
import { useEventCallback } from '@fluentui/react-hooks';
import React, { FocusEventHandler, KeyboardEventHandler, useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'react-use';

type ChangeHandler = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
type KeyHandler = KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
type FocusHandler = FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;

const DEBOUNCE_TIME = 500;

export interface DeferredTextFieldProps extends Omit<ITextFieldProps, 'onChange'> {
    onChange?: (newValue: string | undefined) => void;
}

/**
 * Wrapper for TextField that defers the onChange event until the state is done
 * being changed.
 */
export const DeferredTextField: React.FC<DeferredTextFieldProps> = ({ value, onChange, ...props }) => {
    const [text, setText] = useState(value);

    const didTextChange = useEventCallback((oldValue?: string) => {
        return text !== oldValue;
    });

    useEffect(() => {
        if (didTextChange(value)) {
            setText(value);
        }
    }, [didTextChange, value, setText]);

    const deferOnChange = useCallback<ChangeHandler>((ev, newValue) => setText(newValue), [setText]);

    const notifyChanged = useCallback(
        (newText?: string) => {
            if (newText !== value) {
                onChange?.(newText);
            }
        },
        [value, onChange],
    );

    const onKeyUp = useCallback<KeyHandler>(
        (ev) => {
            if (ev.key === 'Enter') {
                notifyChanged(text);
            }
        },
        [notifyChanged, text],
    );

    const onBlur = useCallback<FocusHandler>(() => {
        notifyChanged(text);
    }, [notifyChanged, text]);

    const [, cancel] = useDebounce(() => notifyChanged(text), DEBOUNCE_TIME, [text]);
    useEffect(() => {
        return cancel;
    });

    return <TextField value={text} onChange={deferOnChange} onKeyUp={onKeyUp} onBlur={onBlur} {...props} />;
};
