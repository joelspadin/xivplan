import Konva from 'konva';
import { GroupConfig } from 'konva/lib/Group';
import React, { ReactNode, RefAttributes } from 'react';
import { Group } from 'react-konva';
import { useObject } from './useObject';

export interface HideGroupProps extends GroupConfig, RefAttributes<Konva.Group> {
    children: ReactNode;
}

/**
 * If the object is hidden, hides this part of it.
 *
 * This may only be used inside an <ObjectContext>
 */
export const HideGroup: React.FC<HideGroupProps> = ({ children, ref, listening, opacity, ...props }) => {
    const hide = useObject().hide;

    return (
        <Group ref={ref} listening={hide ? false : listening} opacity={hide ? 0 : opacity} {...props}>
            {children}
        </Group>
    );
};

/**
 * Similar to HideGroup, except it cuts the shape out of the underlying content instead of just making it transparent.
 * This can be used when the object's highlight is a layer under the object instead of just an outline.
 *
 * This may only be used inside an <ObjectContext>
 */
export const HideCutoutGroup: React.FC<HideGroupProps> = ({
    children,
    ref,
    listening,
    globalCompositeOperation,
    ...props
}) => {
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
};
