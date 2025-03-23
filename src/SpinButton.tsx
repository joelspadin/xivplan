import {
    SpinButton as FluentSpinButton,
    SpinButtonChangeEvent,
    SpinButtonOnChangeData,
    SpinButtonProps,
} from '@fluentui/react-components';
import React, { useCallback } from 'react';
import { formatNumber, fractionDigitsToStep, round } from './util';

export interface CustomSpinButtonProps extends Omit<SpinButtonProps, 'displayValue'> {
    fractionDigits?: number;
}

/**
 * Wrapper around SpinButton which displays nothing instead of NaN if value == undefined
 * and properly handles direct data entry.
 */
export const SpinButton: React.FC<CustomSpinButtonProps> = ({ value, onChange, fractionDigits, ...props }) => {
    fractionDigits ??= 0;

    const wrappedOnChange = useCallback(
        (event: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
            if (!isValid(data.value)) {
                if (!data.displayValue) {
                    return;
                }

                let value = Number(data.displayValue);
                if (!isValid(value)) {
                    return;
                }

                value = round(value, fractionDigitsToStep(fractionDigits));

                if (props.min !== undefined) {
                    value = Math.max(value, props.min);
                }
                if (props.max !== undefined) {
                    value = Math.min(value, props.max);
                }

                data.value = value;
            }

            onChange?.(event, data);
        },
        [onChange, fractionDigits, props.min, props.max],
    );

    return (
        <FluentSpinButton
            {...props}
            value={value ?? NaN}
            displayValue={formatNumber(value, fractionDigits)}
            onChange={wrappedOnChange}
        />
    );
};

function isValid(x: number | null | undefined) {
    return x !== undefined && x !== null && !isNaN(x) && isFinite(x);
}
