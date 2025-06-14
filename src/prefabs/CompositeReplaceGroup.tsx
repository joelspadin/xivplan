import { GroupConfig } from 'konva/lib/Group';
import React, { ReactNode } from 'react';
import { Group } from 'react-konva';

export interface CompositeReplaceGroup extends GroupConfig {
    children: ReactNode;
    enabled?: boolean;
}

/**
 * If enabled and opacity < 1, replaces the underlying content instead of rendering over it with transparency.
 *
 * This can be used when an object's highlight is a layer under the object instead of just an outline.
 * If the object is transparent, this prevents the highlight layer from showing through.
 */
export const CompositeReplaceGroup: React.FC<CompositeReplaceGroup> = ({ enabled, opacity, children }) => {
    const showCutout = enabled && opacity !== undefined && opacity < 1;

    return (
        <>
            {showCutout && (
                <Group listening={false} globalCompositeOperation="destination-out">
                    {children}
                </Group>
            )}
            <Group opacity={opacity}>{children}</Group>
        </>
    );
};
