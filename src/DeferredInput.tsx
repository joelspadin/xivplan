import { Input, InputProps } from '@fluentui/react-components';
import React, { useState } from 'react';
import { useDebounce } from 'react-use';

const DEFAULT_DEBOUNCE_TIME = 1000;

type BlurHandler = Required<InputProps>['onBlur'];
type ChangeHandler = Required<InputProps>['onChange'];
type ChangeHandlerParameters = Parameters<ChangeHandler>;
type KeyUpHandler = Required<InputProps>['onKeyUp'];

export interface DeferredInputProps extends InputProps {
    debounceTime?: number;
}

/**
 * Wrapper for Input that defers the onChange event until the text stops changing.
 */
export const DeferredInput: React.FC<DeferredInputProps> = ({
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

    const notifyChanged = () => {
        if (latestEvent) {
            onChange?.(...latestEvent);
            setLatestEvent(undefined);
        }
    };

    const deferredOnChange: ChangeHandler = (ev, data) => {
        setCurrentValue(data.value);
        setLatestEvent([ev, data]);
    };

    const deferredOnBlur: BlurHandler = (ev) => {
        notifyChanged();
        onBlur?.(ev);
    };

    const deferredOnKeyUp: KeyUpHandler = (ev) => {
        if (ev.key === 'Enter') {
            notifyChanged();
        }
        onKeyUp?.(ev);
    };

    useDebounce(notifyChanged, debounceTime, [currentValue]);

    return (
        <Input
            value={currentValue ?? ''}
            onChange={deferredOnChange}
            onBlur={deferredOnBlur}
            onKeyUp={deferredOnKeyUp}
            {...props}
        />
    );
};
