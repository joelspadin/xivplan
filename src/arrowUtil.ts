import { degtorad } from './util';

export interface ArrowStrokeExtent {
    /** Amount the stroke will extend past the top of the arrow head */
    top: number;
    /** Amount the stroke will extend behind the bottom of the arrow head */
    bottom: number;
    /** Amount the stroke will extend to either side of the arrow head */
    side: number;
}

/**
 * For a triangular arrow head of a given size, determines how much a stroke of a given width, centered on the triangle,
 * will extend past the triangle.
 *
 * @param length Length of the arrow head
 * @param width Width of the arrow head
 * @param strokeWidth Width of the stroke applied around the arrow head
 */
export function getArrowStrokeExtent(length: number, width: number, strokeWidth: number): ArrowStrokeExtent {
    if (length <= 0 || width <= 0 || strokeWidth <= 0) {
        return { top: 0, bottom: 0, side: 0 };
    }

    //           +
    //          /| A
    //         / +
    //        / /|
    //       / / |
    //      / /  | L
    //     / /   |
    //    / /    |
    //   +-+-----+
    //  / /|     | S
    // +-+-+-----+
    //  A B   W
    //
    // Given
    // L = length
    // W = width / 2
    // S = strokeWidth / 2
    // theta = atan(L / W)
    //
    // Then
    // A = S / sin(theta)
    // B = S / tan(theta)
    //
    // Top extension = A = S / sin(theta)
    // Bottom extension = S
    // Side extension = A + B = S * (1 / sin(theta) + 1 / tan(theta))

    const halfStroke = strokeWidth / 2;
    const tangent = length / (width / 2);
    const cotangent = 1 / tangent;
    const cosecant = 1 / Math.sin(Math.atan(tangent));

    return {
        top: halfStroke * cosecant,
        bottom: halfStroke,
        side: halfStroke * (cotangent + cosecant),
    };
}

export interface ArrowPointerDimensions {
    pointerWidth: number;
    pointerLength: number;
}

/**
 * Calculate the pointer width and length to get an arrow matching the given dimensions.
 * @param width the total width of the base of the pointer
 * @param baseAngle the desired angle at the base of the pointer, in degrees
 * @param strokeWidth the stroke width used to draw the arrow
 */
export function getArrowPointerDimensions(
    width: number,
    baseAngle: number,
    strokeWidth: number,
): ArrowPointerDimensions {
    //           +
    //          /| C
    //         / O
    //        / /|
    //       / / |
    //      / /  | L
    //     / /   |
    //    / /    |
    //   +-+-----+
    //  / /|     | S
    // +-+-+-----+
    //  A B   W
    //
    // Given
    // width = (A+B+W) * 2
    // strokeWidth = S * 2
    // tan(baseAngle) = (C+L+S) / (A+B+W)
    //
    // Then
    // cos(baseAngle) = S / C
    // tan(baseAngle) = L / W

    const theta = degtorad(baseAngle);

    const halfStroke = strokeWidth / 2; // S
    const tangent = Math.tan(theta);
    const totalLength = tangent * (width / 2); // C + L + S
    const topExtent = halfStroke / Math.cos(theta); // C
    const pointerLength = totalLength - topExtent - halfStroke; // L
    const halfWidth = pointerLength / tangent; // W

    return { pointerLength, pointerWidth: halfWidth * 2 };
}
