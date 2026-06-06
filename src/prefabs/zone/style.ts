import Color from 'colorjs.io';
import type { ZoneStyle } from '../../scene';

function getStrokeWidth(size: number) {
    return Math.max(2, Math.min(4, size / 100));
}

export function getZoneStyle(color: string, opacity: number, size = 0, style?: ZoneStyle, supportsGradient = false) {
    if (supportsGradient && style === 'gradient') {
        return getGradientStyle(color, opacity, size / 2);
    }

    const strokeWidth = getStrokeWidth(size);
    const c = new Color(color);

    // TODO: update to c.set({ alpha: value }) once colorjs.io v0.6.0 is released
    const fill = c.clone();
    fill.alpha = style === 'stroke' ? 0 : opacity / 100;
    const fillStr = fill.display();

    const stroke = c.clone();
    stroke.alpha = opacity / 50;
    const strokeStr = stroke.display();

    return { fill: fillStr, stroke: strokeStr, strokeWidth };
}

export function getGradientStyle(color: string, opacity: number, radius: number) {
    const c = new Color(color);

    const innerFill = c.clone();
    innerFill.alpha = (opacity * 0.4) / 100;

    const stroke = c.clone();
    stroke.alpha = opacity / 50;
    const strokeStr = stroke.display();

    return {
        fill: strokeStr,
        stroke: strokeStr,
        strokeWidth: getStrokeWidth(radius * 2),
        fillPriority: 'radial-gradient' as const,
        fillRadialGradientStartPoint: { x: 0, y: 0 },
        fillRadialGradientEndPoint: { x: 0, y: 0 },
        fillRadialGradientStartRadius: radius * (13 / 16),
        fillRadialGradientEndRadius: radius,
        fillRadialGradientColorStops: [0, innerFill.display(), 1, strokeStr],
    };
}

export function getArrowStyle(color: string, opacity: number): { fill: string } {
    const c = new Color(color);

    const fill = c.to('hsv').set({ s: (s) => s - 10, v: (v) => v + 20 });
    fill.alpha = opacity / 100;
    const fillStr = fill.display();

    return { fill: fillStr };
}

export function getShadowColor(color: string): string | undefined {
    const c = new Color(color);

    return c
        .to('hsv')
        .set({ s: (s) => s - 10, v: 30 })
        .display();
}

export function getSphericalGradientStops(color: string) {
    const center = new Color(color);

    const top = new Color(center.clone().lighten(0.25));
    const bottom = new Color(center.clone().darken(0.15));

    return [0, top.display(), 0.5, color, 1, bottom.display()];
}
