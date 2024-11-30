import { SpinButton, SpinButtonChangeEvent, SpinButtonOnChangeData } from '@fluentui/react-components';
import React, { useCallback } from 'react';
import { CustomSpinButtonProps } from './SpinButton';
import { round } from './util';

export interface SpinButtonUnitsProps extends CustomSpinButtonProps {
    suffix?: string;
}

const VALUE_REGEX = /^(-?\d+(\.\d+)?).*/;

function getNumericPart(displayValue: string): number {
    const match = displayValue.match(VALUE_REGEX);
    if (match) {
        const numericValue = Number(match[1]);
        return isNaN(numericValue) ? 0 : numericValue;
    }
    return 0;
}

/**
 * Wrapper around SpinButton which displays nothing instead of NaN if value == undefined,
 * properly handles direct data entry, and adds a unit suffix to the display value.
 */
export const SpinButtonUnits: React.FC<SpinButtonUnitsProps> = ({ value, suffix, roundTo, onChange, ...props }) => {
    const displayValue = value === undefined ? '' : `${value}${suffix}`;

    const wrappedOnChange = useCallback(
        (event: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
            if (data.value === undefined && data.displayValue) {
                let value = getNumericPart(data.displayValue);

                if (value !== undefined) {
                    value = round(value, roundTo);

                    if (props.min !== undefined) {
                        value = Math.max(value, props.min);
                    }
                    if (props.max !== undefined) {
                        value = Math.min(value, props.max);
                    }
                }

                data.value = value;
            }

            onChange?.(event, data);
        },
        [onChange, roundTo, props.min, props.max],
    );

    return <SpinButton {...props} value={value ?? 0} displayValue={displayValue} onChange={wrappedOnChange} />;
};
