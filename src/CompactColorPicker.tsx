import {
    ColorSwatch,
    Field,
    Popover,
    PopoverSurface,
    PopoverTrigger,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';
import { ColorPicker } from './ColorPicker';
import { DeferredInput } from './DeferredInput';
import { isValidColor } from './color';

const DEFAULT_DEBOUNCE_TIME = 500;

export interface CompactColorPickerProps {
    debounceTime?: number;
    label?: string;
    color: string;
    onChange?: (color: string) => void;
    placeholder?: string;
}

export const CompactColorPicker: React.FC<CompactColorPickerProps> = ({
    debounceTime,
    color,
    onChange,
    label,
    placeholder,
}) => {
    debounceTime = debounceTime ?? DEFAULT_DEBOUNCE_TIME;

    const classes = useStyles();
    const [colorValid, setColorValid] = useState(true);
    const [debouncedColor, setDebouncedColor] = useState(color);

    const notifyChanged = useCallback(
        (newColor: string) => {
            if (newColor !== color) {
                onChange?.(newColor);
                setDebouncedColor(newColor);
            }
        },
        [color, onChange, setDebouncedColor],
    );

    const [pickerColor, setPickerColor] = useState(color);
    const [, cancel] = useDebounce(() => notifyChanged(pickerColor), debounceTime, [pickerColor]);

    useEffect(() => {
        return cancel;
    }, [cancel]);

    // If the controlled color value changes, reset the internal state to match
    const prevColorRef = useRef<string>();
    useEffect(() => {
        prevColorRef.current = debouncedColor;
    }, [debouncedColor]);
    useEffect(() => {
        if (color !== prevColorRef.current) {
            setDebouncedColor(color);
            setPickerColor(color);
            setColorValid(!color || isValidColor(color));
        }
    }, [color]);

    const setColorText = useCallback(
        (text: string) => {
            const valid = isValidColor(text);
            setColorValid(!text || valid);

            if (valid) {
                notifyChanged(text);
            }
        },
        [notifyChanged, setColorValid],
    );

    return (
        <>
            <Field
                label={label}
                className={classes.field}
                validationMessage={colorValid ? undefined : 'Invalid color'}
                validationState={colorValid ? 'none' : 'error'}
            >
                <div className={classes.wrapper}>
                    <Popover size="small" withArrow>
                        <PopoverTrigger>
                            <ColorSwatch size="small" color={color || '#000'} value={color} />
                        </PopoverTrigger>
                        <PopoverSurface tabIndex={-1}>
                            <ColorPicker value={pickerColor} onChange={setPickerColor} />
                        </PopoverSurface>
                    </Popover>
                    <DeferredInput
                        className={classes.input}
                        value={color}
                        onChange={(ev, data) => setColorText(data.value)}
                        placeholder={placeholder}
                    />
                </div>
            </Field>
        </>
    );
};

const useStyles = makeStyles({
    field: {
        flex: 1,
    },

    wrapper: {
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        marginInlineStart: tokens.spacingHorizontalXS,
    },

    input: {
        minWidth: 'auto',
        width: 0,
        flex: 1,
    },
});
