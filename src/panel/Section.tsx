import { Divider, makeStyles, mergeClasses } from '@fluentui/react-components';
import type { HTMLAttributes } from 'react';
import * as React from 'react';
import { useControlStyles } from '../useControlStyles';
import { PANEL_PADDING } from './PanelStyles';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
    header?: React.ReactNode;
    dividerClassName?: string;
    contentClassName?: string;
}

export const Section: React.FC<SectionProps> = ({ header, children, dividerClassName, contentClassName, ...props }) => {
    const controlClasses = useControlStyles();
    const classes = useStyles();
    // const attributes = useArrowNavigationGroup({ axis: 'grid-linear' });

    return (
        <section {...props}>
            <Divider className={mergeClasses(controlClasses.divider, dividerClassName)}>{header}</Divider>
            <div className={mergeClasses(classes.content, contentClassName)}>{children}</div>
        </section>
    );
};

export const ObjectGroup: React.FC<HTMLAttributes<HTMLElement>> = ({ children, className, ...props }) => {
    const classes = useStyles();

    return (
        <div className={mergeClasses(classes.group, className)} {...props}>
            {children}
        </div>
    );
};

const useStyles = makeStyles({
    group: {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'end',
        gap: `${PANEL_PADDING}px`,
    },
    content: {
        display: 'flex',
        flexFlow: 'column',
        gap: `${PANEL_PADDING}px`,
    },
});
