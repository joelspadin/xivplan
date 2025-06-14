import { Field, Label, Slider, SliderProps, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import React from 'react';

export interface OpacitySliderProps extends SliderProps {
    label?: string;
}

export const OpacitySlider: React.FC<OpacitySliderProps> = ({ label, disabled, className, value, ...props }) => {
    const classes = useStyles();

    const valueText = value === undefined ? '' : `${value}%`;
    const ariaValueText = value === undefined ? '' : `${value} percent`;

    return (
        <Field label={label ?? 'Opacity'} className={className}>
            <div className={classes.wrapper}>
                <Slider
                    value={value ?? 0}
                    min={5}
                    max={100}
                    step={5}
                    aria-valuetext={ariaValueText}
                    className={classes.slider}
                    disabled={disabled}
                    {...props}
                />
                <Label aria-hidden className={mergeClasses(classes.valueLabel, disabled && classes.disabled)}>
                    {valueText}
                </Label>
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
