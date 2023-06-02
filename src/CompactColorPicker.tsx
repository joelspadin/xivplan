import {
    Callout,
    classNamesFunction,
    ColorPicker,
    DirectionalHint,
    FontWeights,
    getColorFromString,
    IStyle,
    Stack,
    Theme,
    useTheme,
} from '@fluentui/react';
import { useBoolean, useId } from '@fluentui/react-hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { DeferredTextField } from './DeferredTextField';

const DEBOUNCE_TIME = 500;

interface IColorPickerStyles {
    callout: IStyle;
    colorBox: IStyle;
    label: IStyle;
}

const getClassNames = classNamesFunction<Theme, IColorPickerStyles>();

export interface CompactColorPickerProps {
    label?: string;
    color: string;
    onChange?: (color: string) => void;
}

export const CompactColorPicker: React.FC<CompactColorPickerProps> = ({ color, onChange, label }) => {
    const theme = useTheme();
    const classNames = getClassNames(() => {
        return {
            colorBox: {
                display: 'inline-block',
                userSelect: 'none',
                cursor: 'pointer',
                width: 22,
                height: 22,
                padding: 0,
                marginLeft: 5,
                marginRight: 10,
                marginTop: 5,
                marginBottom: 5,
                boxSizing: 'border-box',
                borderRadius: 0,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: theme.semanticColors.inputBorder,

                ':hover': {
                    borderWidth: 1,
                    borderColor: theme.palette.neutralSecondary,
                    boxShadow: `inset 0 0 0 1px ${theme.palette.neutralLight}`,
                    padding: 3,
                    backgroundColor: theme.semanticColors.bodyBackground,
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
    const [, cancel] = useDebounce(() => notifyChanged(pickerColor), DEBOUNCE_TIME, [pickerColor]);

    useEffect(() => {
        return cancel;
    });

    const [isCalloutVisible, { setTrue: showCallout, setFalse: hideCallout }] = useBoolean(false);
    const buttonId = useId('color-box');

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

    return (
        <div>
            {label && <label className={classNames.label}>{label}</label>}
            <Stack horizontal verticalAlign="center">
                <Stack.Item onClick={showCallout}>
                    <button type="button" id={buttonId} className={classNames.colorBox}>
                        <svg viewBox="0 0 20 20" fill={color} focusable={false}>
                            <rect width="100%" height="100%" />
                        </svg>
                    </button>
                </Stack.Item>
                <Stack.Item grow>
                    <DeferredTextField title="Color" value={color} onChange={onColorTextChanged} />
                </Stack.Item>
            </Stack>
            {isCalloutVisible && (
                <Callout
                    className={classNames.callout}
                    gapSpace={0}
                    target={`#${buttonId}`}
                    onDismiss={hideCallout}
                    directionalHint={DirectionalHint.bottomCenter}
                    setInitialFocus
                >
                    <ColorPicker
                        color={pickerColor}
                        onChange={(ev, color) => setPickerColor(color.str)}
                        alphaType="none"
                    />
                </Callout>
            )}
        </div>
    );
};
