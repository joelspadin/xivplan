import {
    Field,
    Popover,
    PopoverSurface,
    PopoverTrigger,
    createCustomFocusIndicatorStyle,
    makeResetStyles,
    makeStyles,
    mergeClasses,
    shorthands,
    swatchCSSVars,
    tokens,
} from '@fluentui/react-components';
import React, { useCallback, useState } from 'react';
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
    const resetStyles = useResetStyles();
    const [colorValid, setColorValid] = useState(true);

    const notifyChanged = useCallback(
        (newColor: string) => {
            if (newColor !== color) {
                onChange?.(newColor);
            }
        },
        [color, onChange],
    );

    const [pickerColor, setPickerColor] = useState(color);
    useDebounce(() => notifyChanged(pickerColor), debounceTime, [pickerColor]);

    // If the controlled color value changes, reset the internal state to match
    const [prevColor, setPrevColor] = useState(color);
    if (color !== prevColor) {
        setPrevColor(color);
        setPickerColor(color);
        setColorValid(!color || isValidColor(color));
    }

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
                <DeferredInput
                    contentBefore={{
                        children: (
                            <div className={classes.buttonWrapper}>
                                <Popover size="small" withArrow>
                                    <PopoverTrigger>
                                        <button
                                            className={mergeClasses(resetStyles, classes.button)}
                                            style={{ [swatchCSSVars.color]: color || '#000' }}
                                            aria-label="Open color picker"
                                        />
                                    </PopoverTrigger>
                                    <PopoverSurface tabIndex={-1}>
                                        <ColorPicker value={pickerColor} onChange={setPickerColor} />
                                    </PopoverSurface>
                                </Popover>
                            </div>
                        ),
                    }}
                    className={classes.input}
                    value={color}
                    onChange={(ev, data) => setColorText(data.value)}
                    placeholder={placeholder ?? '#000000'}
                />
            </Field>
        </>
    );
};

const useResetStyles = makeResetStyles({
    display: 'inline-flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    border: `1px solid var(${swatchCSSVars.borderColor})`,
    background: `var(${swatchCSSVars.color})`,
    overflow: 'hidden',
    padding: '0',
    ':hover': {
        cursor: 'pointer',
        border: 'none',
        boxShadow: `
            inset 0 0 0 ${tokens.strokeWidthThick} ${tokens.colorBrandStroke1},
            inset 0 0 0 ${tokens.strokeWidthThicker} ${tokens.colorStrokeFocus1}
        `,
    },
    ':hover:active': {
        border: 'none',
        boxShadow: `
            inset 0 0 0 ${tokens.strokeWidthThicker} ${tokens.colorCompoundBrandStrokePressed},
            inset 0 0 0 ${tokens.strokeWidthThickest} ${tokens.colorStrokeFocus1}
        `,
    },
    ':focus': {
        outline: 'none',
    },
    ':focus-visible': {
        outline: 'none',
    },
    ...createCustomFocusIndicatorStyle({
        border: 'none',
        outline: 'none',
        boxShadow: `
            inset 0 0 0 ${tokens.strokeWidthThick} ${tokens.colorStrokeFocus2},
            inset 0 0 0 ${tokens.strokeWidthThicker} ${tokens.colorStrokeFocus1}
        `,
    }),

    // High contrast styles

    '@media (forced-colors: active)': {
        forcedColorAdjust: 'none',
        ':hover': {
            boxShadow: `
                inset 0 0 0 ${tokens.strokeWidthThick} ${tokens.colorBrandStroke2Hover},
                inset 0 0 0 ${tokens.strokeWidthThicker} ${tokens.colorStrokeFocus1}
            `,
        },
        ':hover:active': {
            boxShadow: `
                inset 0 0 0 ${tokens.strokeWidthThick} ${tokens.colorBrandStroke2Pressed},
                inset 0 0 0 ${tokens.strokeWidthThicker} ${tokens.colorStrokeFocus1}
            `,
        },
    },
});

const useStyles = makeStyles({
    field: {
        flex: 1,
    },

    input: {
        paddingLeft: 0,
        overflow: 'hidden',
    },

    buttonWrapper: {
        display: 'flex',
        flexFlow: 'row',
        boxSizing: 'border-box',
        width: '30px',
        height: '30px',
        padding: '2px',
        marginRight: tokens.spacingHorizontalXS,
    },

    button: {
        width: '100%',
        height: '100%',
        marginRight: tokens.spacingHorizontalXS,
        borderRadius: tokens.borderRadiusMedium,
        ...shorthands.border(tokens.strokeWidthThin, 'solid', tokens.colorNeutralStroke3),
    },
});
