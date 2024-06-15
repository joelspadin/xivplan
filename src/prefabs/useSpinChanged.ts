import { SpinButtonChangeEvent, SpinButtonOnChangeData } from '@fluentui/react-components';
import { useEventCallback } from '@fluentui/react-hooks';
import React from 'react';

export function useSpinChanged(
    callback: (value: number) => void,
): (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => void {
    return useEventCallback((ev, newValue) => {
        if (newValue === undefined) {
            return;
        }

        const value = parseInt(newValue);
        if (isNaN(value)) {
            return;
        }

        callback(value);
    });
}

export function useSpinChanged2(callback: (value: number) => void) {
    return (event: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
        if (typeof data.value === 'number') {
            callback(data.value);
        }
    };
}
