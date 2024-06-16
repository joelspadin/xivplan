import {
    ColorSwatchProps,
    SwatchPicker,
    SwatchPickerProps,
    makeStyles,
    mergeClasses,
    renderSwatchPickerGrid,
    tokens,
} from '@fluentui/react-components';
import React from 'react';

export interface CompactSwatchColorPickerProps extends Omit<SwatchPickerProps, 'children'> {
    swatches: ColorSwatchProps[];
}

export const CompactSwatchColorPicker: React.FC<CompactSwatchColorPickerProps> = ({
    swatches,
    className,
    ...props
}) => {
    const classes = useStyles();

    return (
        <SwatchPicker size="medium" layout="grid" className={mergeClasses(classes.root, className)} {...props}>
            {renderSwatchPickerGrid({ items: swatches, columnCount: 8 })}
        </SwatchPicker>
    );
};

const useStyles = makeStyles({
    root: {
        marginLeft: tokens.spacingHorizontalXXS,
    },
});
