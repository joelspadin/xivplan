import { Tooltip, TooltipProps } from '@fluentui/react-components';
import React from 'react';

export interface OptionalTooltipProps extends Omit<TooltipProps, 'content' | 'children'> {
    children: React.ReactElement;
    content?: TooltipProps['content'];
}

export const OptionalTooltip: React.FC<OptionalTooltipProps> = ({ children, content, ...props }) => {
    return content ? (
        <Tooltip content={content} {...props}>
            {children}
        </Tooltip>
    ) : (
        children
    );
};
