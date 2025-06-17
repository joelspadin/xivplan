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

export function rgbToHex(color: RgbColor): string {
    function hex(channel: number) {
        return channel.toString(16).padStart(2, '0');
    }

    return '#' + hex(color.r) + hex(color.g) + hex(color.b);
}

export function colorToHex(color: Color): string {
    const rgb = colorToRgb(color);

    return rgbToHex(rgb);
}

export function hsvToHex(color: HsvColor): string {
    const rgb = hsvToRgb(color);

    return rgbToHex(rgb);
}

export function colorToRgb(color: Color): RgbColor {
    const rgb = color.to('srgb');

    return { r: Math.round(rgb.r * 255), g: Math.round(rgb.g * 255), b: Math.round(rgb.b * 255) };
}

export function colorToHsv(color: Color): HsvColor {
    const hsv = color.to('hsv');

    return { h: isNaN(hsv.h) ? 0 : hsv.h, s: hsv.s, v: hsv.v };
}

export function colorToHsva(color: Color): HsvaColor {
    const hsv = colorToHsv(color);

    return { ...hsv, a: 1 };
}

export function rgbToColor(color: RgbColor): Color {
    return new Color('srgb', [color.r / 255, color.g / 255, color.b / 255]);
}

export function hsvToRgb(color: HsvColor): RgbColor {
    const rgb = new Color('hsv', [color.h, color.s, color.v]).to('srgb');

    return colorToRgb(rgb);
}

export function rgbToHsv(color: RgbColor): HsvColor {
    const hsv = rgbToColor(color).to('hsv');

    return { h: hsv.h, s: hsv.s, v: hsv.v };
}

export function rgbToHsva(color: RgbColor): HsvaColor {
    const hsv = rgbToHsv(color);

    return { ...hsv, a: 1 };
}
