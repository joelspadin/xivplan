import {
    Field,
    Label,
    Slider,
    type SliderOnChangeData,
    type SliderProps,
    makeStyles,
    mergeClasses,
    tokens,
} from '@fluentui/react-components';
import React, { useState } from 'react';

export interface DiscreteSliderOnChangeData extends SliderOnChangeData {
    transient: boolean;
}

export interface DiscreteSliderProps extends Omit<SliderProps, 'onChange'> {
    label: string;
    showValue?: boolean;
    onChange?: (ev: React.ChangeEvent<HTMLInputElement>, data: DiscreteSliderOnChangeData) => void;
    onCommit?: () => void;
}

export const DiscreteSlider: React.FC<DiscreteSliderProps> = ({
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
                        {valueText}
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
