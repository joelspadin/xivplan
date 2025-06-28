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
