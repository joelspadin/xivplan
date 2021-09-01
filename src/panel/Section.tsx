import { IStackTokens, IStyle, mergeStyleSets, Separator, Stack } from '@fluentui/react';
import * as React from 'react';
import { HTMLAttributes } from 'react';
import { PANEL_PADDING } from './PanelStyles';

const stackTokens: IStackTokens = {
    childrenGap: PANEL_PADDING,
};

const classNames = mergeStyleSets({
    separator: {
        marginBottom: PANEL_PADDING,
    } as IStyle,
    group: {} as IStyle,
});

export interface SectionProps {
    title: string;
}

export const Section: React.FunctionComponent<SectionProps> = ({ title, children }) => {
    return (
        <>
            <Separator className={classNames.separator}>{title}</Separator>
            <Stack tokens={stackTokens}>{children}</Stack>
        </>
    );
};

export const ObjectGroup: React.FunctionComponent<HTMLAttributes<HTMLElement>> = ({ children, ...props }) => {
    return (
        <Stack horizontal wrap horizontalAlign="end" tokens={stackTokens} className={classNames.group} {...props}>
            {children}
        </Stack>
    );
};
