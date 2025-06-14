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
export const HideGroup: React.FC<HideGroupProps> = ({ children, listening, opacity, ...props }) => {
    const hide = useObject().hide;

    return (
        <Group listening={hide ? false : listening} opacity={hide ? 0 : opacity} {...props}>
            {children}
        </Group>
    );
};

/**
 * Similar to HideGroup, except it cuts the shape out of the underlying content instead of just making it transparent.
 * This can be used when the object's highlight is a layer under the object instead of just an outline.
 *
 * This may only be used inside an <ObjectContext.Provider>
 */
export const HideCutoutGroup: React.FC<HideGroupProps> = ({
    children,
    listening,
    globalCompositeOperation,
    ...props
}) => {
    const hide = useObject().hide;

    return (
        <Group
            listening={hide ? false : listening}
            globalCompositeOperation={hide ? 'destination-out' : globalCompositeOperation}
            {...props}
        >
            {children}
        </Group>
    );
};
