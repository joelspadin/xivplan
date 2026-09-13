import {
    Field,
    Label,
    makeStyles,
    mergeClasses,
    Slider,
    tokens,
    type SliderOnChangeData,
    type SliderProps,
} from '@fluentui/react-components';
import React, { useState, type ReactNode } from 'react';

export interface SliderFieldOnChangeData extends SliderOnChangeData {
    transient: boolean;
}

export interface SliderFieldProps extends Omit<SliderProps, 'onChange'> {
    label: string;
    showValue?: boolean | ((value: number | undefined) => ReactNode);
    onChange?: (ev: React.ChangeEvent<HTMLInputElement>, data: SliderFieldOnChangeData) => void;
    onCommit?: () => void;
}

export const SliderField: React.FC<SliderFieldProps> = ({
    label,
    showValue,
    disabled,
    className,
    value,
    onChange,
    onCommit,
    onMouseDown,
    onMouseUp,
    ...props
}) => {
    const classes = useStyles();

    const valueText = value === undefined ? '' : `${value}%`;
    const ariaValueText = value === undefined ? '' : `${value} percent`;

    const [dragging, setDragging] = useState(false);

    const handleChange: SliderProps['onChange'] = (ev, data) => {
        onChange?.(ev, { ...data, transient: dragging });
    };

    const handleMouseDown: SliderProps['onMouseDown'] = (ev) => {
        setDragging(true);
        onMouseDown?.(ev);
    };

    const handleMouseUp: SliderProps['onMouseUp'] = (ev) => {
        setDragging(false);
        onCommit?.();
        onMouseUp?.(ev);
    };

    return (
        <Field label={label} className={className}>
            <div className={classes.wrapper}>
                <Slider
                    value={value ?? 0}
                    aria-valuetext={ariaValueText}
                    className={classes.slider}
                    disabled={disabled}
                    onChange={handleChange}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    {...props}
                />
                {showValue && (
                    <Label aria-hidden className={mergeClasses(classes.valueLabel, disabled && classes.disabled)}>
                        {showValue === true ? valueText : showValue(value)}
                    </Label>
                )}
            </div>
        </Field>
    );
};

const useStyles = makeStyles({
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },

    slider: {
        flexGrow: 1,
    },

    valueLabel: {
        width: `40px`,
        whiteSpace: 'nowrap',
    },

    disabled: {
        color: tokens.colorNeutralForegroundDisabled,
    },
});
