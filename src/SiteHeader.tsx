import {
    classNamesFunction,
    IStackTokens,
    IStyle,
    IToggleStyles,
    Link,
    mergeStyleSets,
    Stack,
    Text,
    Theme,
    Toggle,
    useTheme,
} from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import React, { HTMLAttributes, useContext } from 'react';
import { AboutDialog } from './AboutDialog';
import { CommandBarContext } from './CommandBarProvider';
import { ExternalLink } from './ExternalLink';
import { HelpContext } from './HelpProvider';
import logoUrl from './logo.svg';
import { DarkModeContext } from './ThemeProvider';

const HEADER_HEIGHT = 48;

const classNames = mergeStyleSets({
    root: {
        minHeight: HEADER_HEIGHT,
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
        lineHeight: HEADER_HEIGHT,
        fontWeight: 600,
    } as IStyle,
    commandBar: {
        // TODO: should probably tie this to panel width
        // TODO: handle small windows more gracefully
        marginLeft: 123,
    } as IStyle,
});

const stackTokens: IStackTokens = {
    childrenGap: 20,
};

const toggleStyles: Partial<IToggleStyles> = {
    root: { marginBottom: 0 },
    label: {
        paddingTop: 4,
    },
};

interface IHeaderStyles {
    links: IStyle;
}

const getClassNames = classNamesFunction<Theme, IHeaderStyles>();

export const SiteHeader: React.FC<HTMLAttributes<HTMLElement>> = ({ className, ...props }) => {
    const [aboutOpen, { setTrue: showAbout, setFalse: hideAbout }] = useBoolean(false);
    const [, { setTrue: showHelp }] = useContext(HelpContext);
    const [darkMode, setDarkMode] = useContext(DarkModeContext);
    const [commands] = useContext(CommandBarContext);
    const theme = useTheme();

    const themeClasses = getClassNames(() => {
        return {
            links: {
                'a, a:visited, button': {
                    color: theme.semanticColors.bodyText,
                },
            },
        };
    }, theme);

    return (
        <header className={`${classNames.root} ${className ?? ''}`} {...props}>
            <Stack horizontal wrap verticalAlign="center" tokens={stackTokens}>
                <Stack.Item className={classNames.brand}>
                    <img src={logoUrl} alt="Site logo" className={classNames.icon} />
                    <Text variant="large" className={classNames.title}>
                        XIVPlan
                    </Text>
                </Stack.Item>
                <Stack.Item className={classNames.commandBar} grow>
                    {commands ? commands : <div></div>}
                </Stack.Item>
                <Stack.Item className={themeClasses.links}>
                    <Stack horizontal tokens={stackTokens}>
                        <Link onClick={showHelp}>Help</Link>
                        <Link onClick={showAbout}>About</Link>
                        <ExternalLink href="https://github.com/joelspadin/xivplan" noIcon>
                            GitHub
                        </ExternalLink>
                    </Stack>
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
            <AboutDialog isOpen={aboutOpen} onDismiss={hideAbout} />
        </header>
    );
};
