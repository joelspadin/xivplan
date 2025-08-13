import Konva from 'konva';
import { GroupConfig } from 'konva/lib/Group';
import React, { ReactNode } from 'react';
import { Group } from 'react-konva';
import { useObject } from './useObject';

export interface HideGroupProps extends GroupConfig {
    children: ReactNode;
}

/**
 * If the object is hidden, hides this part of it.
 *
 * This may only be used inside an <ObjectContext.Provider>
 */
export const HideGroup = React.forwardRef<Konva.Group, HideGroupProps>(
    ({ children, listening, opacity, ...props }, ref) => {
        const hide = useObject().hide;

        return (
            <Group ref={ref} listening={hide ? false : listening} opacity={hide ? 0 : opacity} {...props}>
                {children}
            </Group>
        );
    },
);
HideGroup.displayName = 'HideGroup';

/**
 * Similar to HideGroup, except it cuts the shape out of the underlying content instead of just making it transparent.
 * This can be used when the object's highlight is a layer under the object instead of just an outline.
 *
 * This may only be used inside an <ObjectContext.Provider>
 */
export const HideCutoutGroup = React.forwardRef<Konva.Group, HideGroupProps>(
    ({ children, listening, globalCompositeOperation, ...props }, ref) => {
        const hide = useObject().hide;

        return (
            <Group
                ref={ref}
                listening={hide ? false : listening}
                globalCompositeOperation={hide ? 'destination-out' : globalCompositeOperation}
                {...props}
            >
                {children}
            </Group>
        );
    },
);
HideCutoutGroup.displayName = 'HideCutoutGroup';
