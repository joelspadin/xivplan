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

/** Creates a headered section of elements */
export const Section: React.FC<SectionProps> = ({ header, children, dividerClassName, contentClassName, ...props }) => {
    const controlClasses = useControlStyles();
    const classes = useStyles();

    return (
        <section {...props}>
            <Divider className={mergeClasses(controlClasses.divider, dividerClassName)}>{header}</Divider>
            <div className={mergeClasses(classes.content, contentClassName)}>{children}</div>
        </section>
    );
};

/** Creates a right-aligned grid of elements */
export const ObjectGroup: React.FC<HTMLAttributes<HTMLElement>> = ({ children, className, ...props }) => {
    const classes = useStyles();

    return (
        <div className={mergeClasses(classes.group, className)} {...props}>
            {children}
        </div>
    );
};

export interface ObjectGroupGridProps extends HTMLAttributes<HTMLElement> {
    size?: 32 | 40 | 48;
}

/** Creates a grid of elements where all elements are padded to the same square size */
export const ObjectGroupGrid: React.FC<ObjectGroupGridProps> = ({ children, className, size, ...props }) => {
    const classes = useStyles();
    const sizeClass = size === 48 ? classes.groupSize48 : size === 40 ? classes.groupSize40 : classes.groupSize32;

    return (
        <div className={mergeClasses(classes.groupGrid, sizeClass, className)} {...props}>
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

    groupGrid: {
        display: 'grid',
        alignItems: 'center',
        justifyItems: 'center',
        justifyContent: 'end',
        gap: `${PANEL_PADDING}px`,
    },

    groupSize32: {
        gridAutoRows: '32px',
        gridTemplateColumns: 'repeat(auto-fit, 32px)',
    },
    groupSize40: {
        gridAutoRows: '40px',
        gridTemplateColumns: 'repeat(auto-fit, 40px)',
    },
    groupSize48: {
        gridAutoRows: '48px',
        gridTemplateColumns: 'repeat(auto-fit, 48px)',
    },
});
