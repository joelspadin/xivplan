import { Field, Label, Slider, SliderProps, makeStyles, tokens } from '@fluentui/react-components';
import React from 'react';

export interface OpacitySliderProps extends SliderProps {
    label?: string;
}

export const OpacitySlider: React.FC<OpacitySliderProps> = ({ label, ...props }) => {
    const classes = useStyles();

    const valueText = props.value === undefined ? '' : `${props.value}%`;
    const ariaValueText = props.value === undefined ? '' : `${props.value} percent`;

    return (
        <Field label={label ?? 'Opacity'}>
            <div className={classes.wrapper}>
                <Slider
                    min={0}
                    max={100}
                    step={5}
                    aria-valuetext={ariaValueText}
                    className={classes.slider}
                    {...props}
                />
                <Label aria-hidden className={classes.valueLabel}>
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
});
