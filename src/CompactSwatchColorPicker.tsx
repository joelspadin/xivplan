import { IColorCellProps, ISwatchColorPickerProps, ISwatchColorPickerStyles, SwatchColorPicker } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';

export interface CompactSwatchColorPickerProps extends Omit<Partial<ISwatchColorPickerProps>, 'onChange'> {
    color: string;
    swatches: string[];
    onChange?: (color: string) => void;
}

const swatchStyles: Partial<ISwatchColorPickerStyles> = {
    root: {
        marginTop: 5,
        marginBottom: 0,
    },
};

export const CompactSwatchColorPicker: React.FC<CompactSwatchColorPickerProps> = ({
    color,
    swatches,
    onChange,
    ...props
}) => {
    const swatchCells: IColorCellProps[] | undefined = useMemo(() => {
        return swatches.map((s) => ({ id: s, color: s } as IColorCellProps));
    }, [swatches]);

    const onColorSwatchChanged = useCallback(
        (color: string | undefined) => {
            if (color) {
                onChange?.(color);
            }
        },
        [onChange],
    );

    return (
        <SwatchColorPicker
            {...props}
            columnCount={7}
            colorCells={swatchCells}
            cellShape="square"
            cellWidth={22}
            cellHeight={22}
            selectedId={color}
            onChange={(ev, id, color) => onColorSwatchChanged(color)}
            styles={swatchStyles}
        />
    );
};
