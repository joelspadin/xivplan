import Color from 'colorjs.io';

export interface HsvColor {
    h: number;
    s: number;
    v: number;
}

export interface HsvaColor extends HsvColor {
    a: number;
}

export interface RgbColor {
    r: number;
    g: number;
    b: number;
}

export function isValidColor(color: string) {
    try {
        new Color(color);
        return true;
    } catch {
        return false;
    }
}

export function colorToHex(color: Color): string {
    return color.toString({ format: 'hex', collapse: false });
}

export function rgbToHex(color: RgbColor): string {
    return colorToHex(rgbToColor(color));
}

export function hsvToHex(color: HsvColor): string {
    return colorToHex(hsvToColor(color));
}

/**
 * Rescales a color component from float [0, 1] to integer [0, 255]
 */
function scaleTo255(channel: number | null) {
    return Math.round((channel ?? 0) * 255);
}

export function colorToRgb(color: Color): RgbColor {
    const rgb = color.to('srgb');

    return { r: scaleTo255(rgb.r), g: scaleTo255(rgb.g), b: scaleTo255(rgb.b) };
}

export function colorToHsv(color: Color): HsvColor {
    const hsv = color.to('hsv');

    return { h: hsv.h ?? 0, s: hsv.s ?? 0, v: hsv.v ?? 0 };
}

export function colorToHsva(color: Color): HsvaColor {
    const hsv = colorToHsv(color);

    return { ...hsv, a: 1 };
}

export function rgbToColor(color: RgbColor): Color {
    return new Color('srgb', [color.r / 255, color.g / 255, color.b / 255]);
}

export function hsvToColor(color: HsvColor): Color {
    return new Color('hsv', [color.h, color.s, color.v]);
}

export function hsvToRgb(color: HsvColor): RgbColor {
    return colorToRgb(hsvToColor(color));
}

export function rgbToHsv(color: RgbColor): HsvColor {
    return colorToHsv(rgbToColor(color));
}

export function rgbToHsva(color: RgbColor): HsvaColor {
    return colorToHsva(rgbToColor(color));
}
