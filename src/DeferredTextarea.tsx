import { Textarea, TextareaProps } from '@fluentui/react-components';
import React, { useCallback, useState } from 'react';
import { useDebounce } from 'react-use';

const DEFAULT_DEBOUNCE_TIME = 1000;

type BlurHandler = Required<TextareaProps>['onBlur'];
type ChangeHandler = Required<TextareaProps>['onChange'];
type ChangeHandlerParameters = Parameters<ChangeHandler>;
type KeyUpHandler = Required<TextareaProps>['onKeyUp'];

export interface DeferredTextareaProps extends TextareaProps {
    debounceTime?: number;
}

/**
 * Wrapper for Textarea that defers the onChange event until the text stops changing.
 */
export const DeferredTextarea: React.FC<DeferredTextareaProps> = ({
    debounceTime,
    value,
    onBlur,
    onChange,
    onKeyUp,
    ...props
}) => {
    debounceTime = debounceTime ?? DEFAULT_DEBOUNCE_TIME;

    const [prevValue, setPrevValue] = useState(value);
    const [currentValue, setCurrentValue] = useState(value);
    const [latestEvent, setLatestEvent] = useState<ChangeHandlerParameters>();

    if (value !== prevValue) {
        setPrevValue(value);
        setCurrentValue(value);
        setLatestEvent(undefined);
    }

    const notifyChanged = useCallback(() => {
        if (latestEvent) {
            onChange?.(...latestEvent);
            setLatestEvent(undefined);
        }
    }, [latestEvent, setLatestEvent, onChange]);

    const deferredOnChange = useCallback<ChangeHandler>(
        (ev, data) => {
            setCurrentValue(data.value);
            setLatestEvent([ev, data]);
        },
        [setCurrentValue, setLatestEvent],
    );

    const deferredOnBlur = useCallback<BlurHandler>(
        (ev) => {
            notifyChanged();
            onBlur?.(ev);
        },
        [notifyChanged, onBlur],
    );

    const deferredOnKeyUp = useCallback<KeyUpHandler>(
        (ev) => {
            if (ev.key === 'Enter') {
                notifyChanged();
            }
            onKeyUp?.(ev);
        },
        [notifyChanged, onKeyUp],
    );

    useDebounce(notifyChanged, debounceTime, [currentValue]);

    return (
        <Textarea
            value={currentValue ?? ''}
            onChange={deferredOnChange}
            onBlur={deferredOnBlur}
            onKeyUp={deferredOnKeyUp}
            {...props}
        />
    );
};
