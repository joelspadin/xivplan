import {
    SpinButton as FluentSpinButton,
    SpinButtonChangeEvent,
    SpinButtonOnChangeData,
    SpinButtonProps,
} from '@fluentui/react-components';
import React, { useCallback } from 'react';

/**
 * Wrapper around SpinButton which displays nothing instead of NaN if value == undefined
 * and properly handles direct data entry.
 */
export const SpinButton: React.FC<Omit<SpinButtonProps, 'displayValue'>> = ({ value, onChange, ...props }) => {
    const wrappedOnChange = useCallback(
        (event: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
            if (data.value === undefined && data.displayValue) {
                let value = Number(data.displayValue);

                if (!isNaN(value)) {
                    value = Math.round(value);

                    if (props.min !== undefined) {
                        value = Math.max(value, props.min);
                    }
                    if (props.max !== undefined) {
                        value = Math.min(value, props.max);
                    }

                    data.value = value;
                }
            }

            onChange?.(event, data);
        },
        [onChange, props.min, props.max],
    );

    return (
        <FluentSpinButton
            {...props}
            value={value ?? 0}
            displayValue={value?.toString() ?? ''}
            onChange={wrappedOnChange}
        />
    );
};
