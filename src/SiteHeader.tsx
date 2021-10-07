import {
    classNamesFunction,
    IStackTokens,
    IStyle,
    IToggleStyles,
    mergeStyleSets,
    Stack,
    Text,
    Theme,
    Toggle,
    useTheme,
} from '@fluentui/react';
import React, { HTMLAttributes, useContext } from 'react';
import { ExternalLink } from './ExternalLink';
import logoUrl from './logo.svg';
import { DarkModeContext } from './ThemeProvider';

export const SiteHeaderHeight = 48;

const classNames = mergeStyleSets({
    root: {
        height: SiteHeaderHeight,

        a: {
            textDecoration: 'none',
            display: 'inline-block',
            boxSizing: 'border-box',
            height: SiteHeaderHeight,
            padding: '15px 8px 11px',
            ':hover, :focus': {
                textDecoration: 'underline',
            },
        },
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

interface IHeaderStyles {
    links: IStyle;
}

const getClassNames = classNamesFunction<Theme, IHeaderStyles>();

export const SiteHeader: React.FunctionComponent<HTMLAttributes<HTMLElement>> = ({ className, ...props }) => {
    const [darkMode, setDarkMode] = useContext(DarkModeContext);
    const theme = useTheme();

    const themeClasses = getClassNames(() => {
        return {
            links: {
                marginRight: 20,
                'a, a:visited': {
                    color: theme.semanticColors.bodyText,
                },
            },
        };
    }, theme);

    return (
        <header className={`${classNames.root} ${className ?? ''}`} {...props}>
            <Stack horizontal wrap verticalAlign="center" tokens={stackTokens}>
                <Stack.Item className={classNames.brand} grow>
                    <img src={logoUrl} alt="Site logo" className={classNames.icon} />
                    <Text variant="large" className={classNames.title}>
                        FFXIV Raid Planner
                    </Text>
                </Stack.Item>
                <Stack.Item className={themeClasses.links}>
                    <ExternalLink href="https://github.com/joelspadin/xivplan" noIcon>
                        GitHub
                    </ExternalLink>
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
