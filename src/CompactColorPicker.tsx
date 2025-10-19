import {
    Field,
    Popover,
    PopoverProps,
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
import React, { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { DeferredInput } from './DeferredInput';
import { isValidColor } from './color';

export interface CompactColorPickerOnChangeData {
    value: string;
    transient: boolean;
}

export interface CompactColorPickerProps {
    className?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    color: string;
    onChange?: (data: CompactColorPickerOnChangeData) => void;
    onCommit?: () => void;
}

export const CompactColorPicker: React.FC<CompactColorPickerProps> = ({
    className,
    color,
    disabled,
    label,
    placeholder,
    onChange,
    onCommit,
}) => {
    const classes = useStyles();
    const resetStyles = useResetStyles();

    const [colorValid, setColorValid] = useState(true);
    const [prevText, setPrevText] = useState(color);
    const [currentText, setCurrentText] = useState(color);

    // If the external text is changed, update the text box to match.
    if (color !== prevText) {
        setPrevText(color);
        setCurrentText(color);
    }

    const notifyChanged = (data: CompactColorPickerOnChangeData) => {
        if (data.value !== color) {
            setColorValid(true);
            onChange?.(data);
        }
    };

    const handlePopoverOpenChanged: PopoverProps['onOpenChange'] = (ev, data) => {
        if (!data.open) {
            onCommit?.();
        }
    };

    const setColorText = (text: string, transient: boolean) => {
        setCurrentText(text);

        if (isValidColor(text)) {
            setColorValid(true);
            notifyChanged({ value: text, transient });
        } else {
            setColorValid(!text);
        }
    };

    return (
        <>
            <Field
                label={label}
                className={mergeClasses(classes.field, className)}
                validationMessage={colorValid ? undefined : 'Invalid color'}
                validationState={colorValid ? 'none' : 'error'}
            >
                <DeferredInput
                    contentBefore={{
                        children: (
                            <div className={classes.buttonWrapper}>
                                <Popover size="small" withArrow onOpenChange={handlePopoverOpenChanged}>
                                    <PopoverTrigger>
                                        <button
                                            className={mergeClasses(resetStyles, classes.button)}
                                            style={{ [swatchCSSVars.color]: color || '#000' }}
                                            aria-label="Open color picker"
                                        />
                                    </PopoverTrigger>
                                    <PopoverSurface tabIndex={-1}>
                                        <ColorPicker
                                            value={color}
                                            onChange={(value) => notifyChanged({ value, transient: true })}
                                        />
                                    </PopoverSurface>
                                </Popover>
                            </div>
                        ),
                    }}
                    className={classes.input}
                    value={currentText}
                    onChange={(ev, data) => setColorText(data.value, true)}
                    onCommit={onCommit}
                    placeholder={placeholder ?? '#000000'}
                    disabled={disabled}
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
