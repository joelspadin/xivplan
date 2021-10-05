import {
    Callout,
    classNamesFunction,
    ColorPicker,
    FontWeights,
    getColorFromString,
    IColorCellProps,
    IStyle,
    ISwatchColorPickerStyles,
    Stack,
    SwatchColorPicker,
    Theme,
    useTheme,
} from '@fluentui/react';
import { useBoolean, useId } from '@fluentui/react-hooks';
import React, { useCallback, useMemo, useState } from 'react';
import { useDebounce } from 'react-use';
import { DeferredTextField } from './DeferredTextField';

const DEBOUNCE_TIME = 500;

const swatchStyles: Partial<ISwatchColorPickerStyles> = {
    root: {
        marginBottom: 0,
    },
};

interface IColorPickerStyles {
    callout: IStyle;
    colorBox: IStyle;
    label: IStyle;
    swatches: IStyle;
}

const getClassNames = classNamesFunction<Theme, IColorPickerStyles>();

export interface CompactColorPickerProps {
    label?: string;
    color: string;
    onChange?: (color: string) => void;
    swatches?: string[];
}

export const CompactColorPicker: React.FC<CompactColorPickerProps> = ({ color, onChange, label, swatches }) => {
    const theme = useTheme();
    const classNames = getClassNames(() => {
        return {
            colorBox: {
                width: 20,
                height: 20,
                marginLeft: 5,
                marginRight: 10,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: theme.semanticColors.inputBorder,

                ':hover': {
                    borderColor: theme.semanticColors.inputBorderHovered,
                } as IStyle,
            },
            label: [
                theme.fonts.medium,
                {
                    padding: '5px 0',
                    fontWeight: FontWeights.semibold,
                    display: 'inline-block',
                },
            ],
            swatches: {
                padding: '0 10px',
            },
        };
    }, theme);

    const notifyChanged = useCallback(
        (newColor: string) => {
            if (newColor !== color) {
                onChange?.(newColor);
            }
        },
        [color, onChange],
    );

    const [pickerColor, setPickerColor] = useState(color);
    useDebounce(() => notifyChanged(pickerColor), DEBOUNCE_TIME, [pickerColor]);

    const [isCalloutVisible, { setTrue: showCallout, setFalse: hideCallout }] = useBoolean(false);
    const buttonId = useId('color-box');

    const swatchCells: IColorCellProps[] | undefined = useMemo(() => {
        if (!swatches) {
            return undefined;
        }
        return swatches.map((s) => ({ id: s, color: s } as IColorCellProps));
    }, [swatches]);

    const onColorTextChanged = useCallback(
        (text: string | undefined) => {
            if (text) {
                const color = getColorFromString(text);
                if (color) {
                    notifyChanged(color.str);
                }
            }
        },
        [notifyChanged],
    );

    const onColorSwatchChanged = useCallback(
        (color: string | undefined) => {
            if (color) {
                notifyChanged(color);
            }
        },
        [notifyChanged],
    );

    return (
        <div>
            {label && <label className={classNames.label}>{label}</label>}
            <Stack horizontal verticalAlign="center">
                <div
                    id={buttonId}
                    className={classNames.colorBox}
                    style={{ backgroundColor: color }}
                    onClick={showCallout}
                />
                <Stack.Item grow>
                    <DeferredTextField value={color} onChange={onColorTextChanged} />
                </Stack.Item>
            </Stack>
            {isCalloutVisible && (
                <Callout
                    className={classNames.callout}
                    gapSpace={0}
                    target={`#${buttonId}`}
                    onDismiss={hideCallout}
                    setInitialFocus
                >
                    {swatchCells && (
                        <SwatchColorPicker
                            className={classNames.swatches}
                            columnCount={6}
                            colorCells={swatchCells}
                            cellShape="square"
                            cellWidth={32}
                            cellHeight={32}
                            selectedId={color}
                            onChange={(ev, id, color) => onColorSwatchChanged(color)}
                            styles={swatchStyles}
                        />
                    )}
                    <ColorPicker color={color} onChange={(ev, color) => setPickerColor(color.str)} alphaType="none" />
                </Callout>
            )}
        </div>
    );
};
