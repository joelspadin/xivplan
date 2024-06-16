import { Divider, makeStyles, mergeClasses } from '@fluentui/react-components';
import * as React from 'react';
import { HTMLAttributes } from 'react';
import { useControlStyles } from '../useControlStyles';
import { PANEL_PADDING } from './PanelStyles';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
    title?: string;
}

export const Section: React.FC<SectionProps> = ({ title, children, ...props }) => {
    const controlClasses = useControlStyles();
    const classes = useStyles();

    return (
        <section {...props}>
            <Divider className={controlClasses.divider}>{title}</Divider>
            <div className={classes.sectionChildren}>{children}</div>
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
    sectionChildren: {
        display: 'flex',
        flexFlow: 'column',
        gap: `${PANEL_PADDING}px`,
    },
});
