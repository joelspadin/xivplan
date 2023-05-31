import { getIcon, ILinkProps, Link, memoizeFunction, mergeStyleSets } from '@fluentui/react';
import React from 'react';

const getClassNames = memoizeFunction(() => {
    const icon = getIcon('NavigateExternalInline');

    return mergeStyleSets({
        link: {
            display: 'inline-block',
            '::after': {
                fontFamily: icon?.subset.fontFace?.fontFamily,
                content: `"${icon?.code}"`,
                display: 'inline-block',
                paddingInlineStart: 1,
            },
        },
    });
});

export interface IExternalLinkProps extends ILinkProps {
    noIcon?: boolean;
}

/**
 * Open a link in a new tab/window.
 */
export const ExternalLink: React.FC<IExternalLinkProps> = ({ children, noIcon, className, ...props }) => {
    const classNames = getClassNames();
    className = `${className ?? ''} ${noIcon ? '' : classNames.link}`;

    return (
        <Link target="_blank" rel="noreferrer" className={className} {...props}>
            {children}
        </Link>
    );
};
