import { IStackTokens, IStyle, IToggleStyles, mergeStyleSets, Stack, Text, Toggle } from '@fluentui/react';
import React, { HTMLAttributes, useContext } from 'react';
import logoUrl from './logo.svg';
import { DarkModeContext } from './ThemeProvider';

export const SiteHeaderHeight = 48;

const classNames = mergeStyleSets({
    root: {
        height: SiteHeaderHeight,
    } as IStyle,
    brand: {
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
    } as IStyle,
    icon: {
        width: 32,
        height: 32,
        paddingLeft: 8,
        marginRight: 8,
        display: 'block',
    } as IStyle,
    title: {
        lineHeight: SiteHeaderHeight,
        fontWeight: 600,
    } as IStyle,
});

const stackTokens: IStackTokens = {
    childrenGap: 20,
};

const toggleStyles: Partial<IToggleStyles> = {
    root: { marginBottom: 0 },
    label: {
        display: 'block',
    },
};

export const SiteHeader: React.FunctionComponent<HTMLAttributes<HTMLElement>> = ({ className, ...props }) => {
    const [darkMode, setDarkMode] = useContext(DarkModeContext);

    return (
        <header className={`${classNames.root} ${className ?? ''}`} {...props}>
            <Stack horizontal wrap verticalAlign="center" tokens={stackTokens}>
                <Stack.Item className={classNames.brand} grow>
                    <img src={logoUrl} alt="Site logo" className={classNames.icon} />
                    <Text variant="large" className={classNames.title}>
                        FFXIV Raid Planner
                    </Text>
                </Stack.Item>
                <Stack.Item>
                    <Toggle
                        label="Theme"
                        inlineLabel
                        styles={toggleStyles}
                        onText="Dark"
                        offText="Light"
                        checked={darkMode}
                        onChange={(ev, checked) => {
                            setDarkMode(!!checked);
                        }}
                    />
                </Stack.Item>
            </Stack>
        </header>
    );
};
