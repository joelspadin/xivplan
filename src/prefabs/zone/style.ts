import { getColorFromString, updateA, updateSV } from '@fluentui/react';

function getStrokeWidth(size: number) {
    return Math.max(2, Math.min(4, size / 100));
}

export function getZoneStyle(
    color: string,
    opacity: number,
    size = 0,
    hollow = false,
): { fill: string; stroke: string; strokeWidth: number } {
    const strokeWidth = getStrokeWidth(size);
    const c = getColorFromString(color);

    if (!c) {
        return { fill: color, stroke: color, strokeWidth };
    }

    const fill = updateA(c, hollow ? 0 : opacity).str;
    const stroke = updateA(c, opacity * 2).str;

    return { fill, stroke, strokeWidth };
}

export function getArrowStyle(color: string, opacity: number): { fill: string } {
    const c = getColorFromString(color);

    if (!c) {
        return { fill: color };
    }

    const bright = updateSV(c, c.s - 10, c.v + 20);
    const fill = updateA(bright, opacity).str;

    return { fill };
}

export function getShadowColor(color: string): string | undefined {
    const c = getColorFromString(color);
    if (!c) {
        return undefined;
    }

    return updateSV(c, c.s - 10, 30).str;
}
