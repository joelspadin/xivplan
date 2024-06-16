import { ColorPicker } from '@fluentui/react';
import {
    ColorSwatch,
    Field,
    Popover,
    PopoverSurface,
    PopoverTrigger,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import Color from 'colorjs.io';
import React, { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import { DeferredInput } from './DeferredInput';

const DEBOUNCE_TIME = 1000;

export interface CompactColorPickerProps {
    label?: string;
    color: string;
    onChange?: (color: string) => void;
}

export const CompactColorPicker: React.FC<CompactColorPickerProps> = ({ color, onChange, label }) => {
    const classes = useStyles();

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
    }, [cancel]);

    const setColorText = useCallback(
        (text: string) => {
            try {
                const color = new Color(text);
                notifyChanged(color.to('srgb').toString({ format: 'hex' }));
            } catch (ex) {
                if (!(ex instanceof TypeError)) {
                    console.error(ex);
                }
            }
        },
        [notifyChanged],
    );

    return (
        <>
            <Field label={label} className={classes.field}>
                <div className={classes.wrapper}>
                    <Popover size="small" appearance="inverted" withArrow>
                        <PopoverTrigger>
                            <ColorSwatch size="small" color={color || '#000'} value={color} />
                        </PopoverTrigger>
                        <PopoverSurface tabIndex={-1}>
                            {/* TODO: migrate ColorPicker once a replacement exists */}
                            <ColorPicker
                                color={pickerColor}
                                onChange={(ev, color) => setPickerColor(color.str)}
                                alphaType="none"
                            />
                        </PopoverSurface>
                    </Popover>
                    <DeferredInput
                        className={classes.input}
                        value={color}
                        onChange={(ev, data) => setColorText(data.value)}
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
