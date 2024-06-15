import { SpinButton, SpinButtonChangeEvent, SpinButtonOnChangeData, SpinButtonProps } from '@fluentui/react-components';
import React, { useCallback } from 'react';

export interface SpinButtonUnitsProps extends SpinButtonProps {
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

export const SpinButtonUnits: React.FC<SpinButtonUnitsProps> = ({ suffix, onChange, ...props }) => {
    const displayValue = `${props.value}${suffix}`;

    const wrappedOnChange = useCallback(
        (event: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
            if (data.value === undefined && data.displayValue) {
                let value = getNumericPart(data.displayValue);

                if (value !== undefined) {
                    if (props.step !== undefined) {
                        value = Math.round(value / props.step) * props.step;
                    }
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
        [onChange, props.min, props.max, props.step],
    );

    return <SpinButton {...props} displayValue={displayValue} onChange={wrappedOnChange} />;
};
