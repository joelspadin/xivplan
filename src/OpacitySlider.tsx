import { ISliderProps, ISliderStyles, Slider } from '@fluentui/react';
import React from 'react';

const styles: Partial<ISliderStyles> = {
    titleLabel: {
        paddingTop: 5,
    },
};

export const OpacitySlider: React.FC<ISliderProps> = (props) => {
    return (
        <Slider
            label="Opacity"
            min={5}
            max={100}
            step={5}
            ariaValueText={(x) => `${x} percent`}
            valueFormat={(x) => `${x}%`}
            styles={styles}
            {...props}
        />
    );
};
