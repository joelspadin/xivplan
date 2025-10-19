import { Field, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import Hue from '@uiw/react-color-hue';
import Saturation from '@uiw/react-color-saturation';
import Color from 'colorjs.io';
import React, { HTMLAttributes, useState } from 'react';
import { SpinButton } from './SpinButton';
import { HsvaColor, RgbColor, colorToHsva, hsvToHex, hsvToRgb, rgbToHsva } from './color';

export interface ColorPickerProps {
    className?: string;
    value?: string;
    onChange?: (color: string) => void;
}

const BLACK: HsvaColor = { h: 0, s: 0, v: 0, a: 1 };

export const ColorPicker: React.FC<ColorPickerProps> = ({ className, value, onChange }) => {
    const classes = useStyles();
    const [color, setColor] = useState<HsvaColor>(parseColorHsva(value) ?? BLACK);
    const rgb = hsvToRgb(color);

    const onSaturationChange = (data: HsvaColor) => {
        setColor(data);
        onChange?.(hsvToHex(color));
    };

    const onHueChange = (data: { h: number }) => {
        const updated = { ...color, h: data.h };
        setColor(updated);
        onChange?.(hsvToHex(updated));
    };

    const onRgbChange = (data: Partial<RgbColor>) => {
        const updated = rgbToHsva({ ...rgb, ...data });
        setColor(updated);
        onChange?.(hsvToHex(updated));
    };

    return (
        <div className={mergeClasses(classes.root, className)}>
            <Saturation
                hsva={color}
                onChange={onSaturationChange}
                className={classes.raised}
                radius={tokens.borderRadiusMedium}
                pointer={({ left, top, color }) => <Pointer style={{ left, top }} color={color ?? ''} />}
            />
            <div className={mergeClasses(classes.hue, classes.raised)}>
                <Hue
                    hue={color.h}
                    onChange={onHueChange}
                    radius={`calc(${tokens.borderRadiusMedium} - 1px)`}
                    pointer={({ left }) => (
                        <Pointer style={{ left, top: '50%' }} color={`hsl(${color.h || 0}deg 100% 50%)`} />
                    )}
                />
            </div>
            <div className={classes.components}>
                <Field label="Red" className={classes.input}>
                    <SpinButton
                        value={rgb.r}
                        min={0}
                        max={255}
                        onChange={(ev, data) => onRgbChange({ r: data.value ?? undefined })}
                    />
                </Field>
                <Field label="Green" className={classes.input}>
                    <SpinButton
                        value={rgb.g}
                        min={0}
                        max={255}
                        onChange={(ev, data) => onRgbChange({ g: data.value ?? undefined })}
                    />
                </Field>
                <Field label="Blue" className={classes.input}>
                    <SpinButton
                        value={rgb.b}
                        min={0}
                        max={255}
                        onChange={(ev, data) => onRgbChange({ b: data.value ?? undefined })}
                    />
                </Field>
            </div>
        </div>
    );
};

interface PointerProps extends HTMLAttributes<HTMLDivElement> {
    color: string;
}

const Pointer: React.FC<PointerProps> = ({ style, color, ...props }) => {
    const classes = useStyles();
    return (
        <div {...props} style={style} className={classes.thumbOuter}>
            <div style={{ backgroundColor: color }} className={classes.thumbInner} />
        </div>
    );
};

function parseColorHsva(value: string | undefined): HsvaColor | undefined {
    if (!value) {
        return undefined;
    }

    try {
        return colorToHsva(new Color(value));
    } catch {
        return undefined;
    }
}

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexFlow: 'column',
    },

    raised: {
        boxShadow: tokens.shadow2,
        border: `1px solid ${tokens.colorNeutralBackgroundStatic}`,
    },

    hue: {
        marginTop: tokens.spacingVerticalM,
        marginBottom: tokens.spacingVerticalXS,
        background: tokens.colorNeutralBackgroundStatic,
        borderRadius: tokens.borderRadiusMedium,
    },

    components: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: tokens.spacingHorizontalS,
    },

    input: {
        width: '60px',
    },

    thumbOuter: {
        position: 'absolute',
        width: '20px',
        height: '20px',
        transform: 'translate(-50%, -50%)',
        background: tokens.colorNeutralBackgroundStatic,
        borderRadius: tokens.borderRadiusCircular,
        border: `2px solid ${tokens.colorNeutralBackgroundStatic}`,
        boxShadow: tokens.shadow2,
        zIndex: 1,
    },

    thumbInner: {
        borderRadius: tokens.borderRadiusCircular,
        width: '100%',
        height: '100%',
    },
});
