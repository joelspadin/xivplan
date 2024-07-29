import { SplitButton, SplitButtonProps, ToolbarButton, ToolbarButtonProps, Tooltip } from '@fluentui/react-components';
import React from 'react';
import { useMedia } from 'react-use';

const WIDE_MEDIA_QUERY = '(min-width: 1250px)';

export const CollapsableToolbarButton: React.FC<ToolbarButtonProps> = ({ children, ...props }) => {
    const isWide = useMedia(WIDE_MEDIA_QUERY);

    if (isWide) {
        return <ToolbarButton {...props}>{children}</ToolbarButton>;
    }

    return (
        <Tooltip content={<div>{children}</div>} relationship="label" withArrow>
            <ToolbarButton {...props} />
        </Tooltip>
    );
};

export const CollapsableSplitButton: React.FC<SplitButtonProps> = ({ children, ...props }) => {
    const isWide = useMedia(WIDE_MEDIA_QUERY);

    if (isWide) {
        return <SplitButton {...props}>{children}</SplitButton>;
    }

    return (
        <Tooltip content={<div>{children}</div>} relationship="label" withArrow>
            <SplitButton {...props} />
        </Tooltip>
    );
};
