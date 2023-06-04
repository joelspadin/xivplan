import { ISliderProps, ISliderStyles, Slider } from '@fluentui/react';
import React from 'react';

const styles: Partial<ISliderStyles> = {
    titleLabel: {
        paddingTop: 5,
    },
    container: {
        marginTop: 5,
        marginBottom: 4,
    },
};

export const OpacitySlider: React.FC<ISliderProps> = (props) => {
    const valueFormat: (x: number) => string = props.value === undefined ? () => '' : (x) => `${x}%`;

    return (
        <Slider
            label="Opacity"
            min={5}
            max={100}
            step={5}
            ariaValueText={(x) => `${x} percent`}
            valueFormat={valueFormat}
            styles={styles}
            {...props}
        />
    );
};
