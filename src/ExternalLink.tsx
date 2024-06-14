import { Link, makeStyles } from '@fluentui/react-components';
import { NavigateExternalInlineIcon } from '@fluentui/react-icons-mdl2';
import React, { AnchorHTMLAttributes } from 'react';

const useStyles = makeStyles({
    external: {
        paddingInlineStart: '1px',
        verticalAlign: 'top',
        marginTop: '1px',
    },
});

export interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    noIcon?: boolean;
}

/**
 * Open a link in a new tab/window.
 */
export const ExternalLink: React.FC<ExternalLinkProps> = ({ children, noIcon, ...props }) => {
    const classes = useStyles();

    return (
        <Link target="_blank" rel="noreferrer" {...props}>
            {children}
            {noIcon || <NavigateExternalInlineIcon className={classes.external} />}
        </Link>
    );
};
