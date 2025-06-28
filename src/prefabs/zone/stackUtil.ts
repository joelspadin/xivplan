import { CircleConfig } from 'konva/lib/shapes/Circle';
import { degtorad } from '../../util';

export interface StackCircleOptions {
    singleSize: number;
    baseSize: number;
    sizeIncrement: number;
    baseCenter: number;
    centerIncrement: number;
}

export const STACK_CIRCLE_INSET: StackCircleOptions = {
    singleSize: 0.45,
    baseSize: 0.35,
    sizeIncrement: -0.02,
    baseCenter: 0.42,
    centerIncrement: 0.05,
};

export const STACK_CIRCLE_RING: StackCircleOptions = {
    singleSize: 0,
    baseSize: 0.55,
    sizeIncrement: -0.02,
    baseCenter: 1,
    centerIncrement: 0,
};

export function getStackCircleProps(
    radius: number,
    count: number,
    options?: Partial<StackCircleOptions>,
): Partial<CircleConfig>[] {
    const { singleSize, baseSize, sizeIncrement, baseCenter, centerIncrement } = { ...STACK_CIRCLE_RING, ...options };

    if (count === 0) {
        return [];
    }

    if (count === 1) {
        return [{ radius: radius * singleSize }];
    }

    const angleOffset = 180 / count + 90;
    const size = baseSize + (count - 2) * sizeIncrement;
    const center = baseCenter + (count - 2) * centerIncrement;
    const r = center * radius;

    return Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i - angleOffset;

        const rad = degtorad(angle);
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;

        return {
            x,
            y,
            radius: radius * size,
        };
    });
}
