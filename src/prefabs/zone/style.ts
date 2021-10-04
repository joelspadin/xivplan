import { getColorFromString, updateA, updateSV } from '@fluentui/react';
import { ShapeConfig } from 'konva/lib/Shape';

function getStrokeWidth(size: number) {
    return Math.max(2, Math.min(4, size / 100));
}

export function getZoneStyle(color: string, opacity: number, size = 0): ShapeConfig {
    const c = getColorFromString(color);

    if (!c) {
        return { fill: color };
    }

    const fill = updateA(c, opacity).str;
    const stroke = updateA(c, opacity * 2).str;
    const strokeWidth = getStrokeWidth(size);

    return { fill, stroke, strokeWidth };
}

export function getArrowStyle(color: string, opacity: number): ShapeConfig {
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
