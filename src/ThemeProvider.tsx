import { FluentProvider, makeStyles } from '@fluentui/react-components';
import React, { PropsWithChildren, useEffect } from 'react';
import { useLocalStorage, useMedia } from 'react-use';
import { getFluentTheme, usePanelThemeStyle, useSceneThemeStyle } from './theme';
import { DarkModeContext } from './ThemeContext';

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const prefersDarkMode = useMedia('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useLocalStorage('darkmode', prefersDarkMode);
    const classes = useStyles();

    // TODO: remove this hack once https://github.com/microsoft/fluentui/issues/31211 is implemented.
    useEffect(() => {
        document.documentElement.className = darkMode ? classes.dark : classes.light;
    }, [classes, darkMode]);

    return (
        <DarkModeContext value={[!!darkMode, setDarkMode]}>
            <ThemeProviderInner darkMode={darkMode}>{children}</ThemeProviderInner>
        </DarkModeContext>
    );
};

interface ThemeProviderInnerProps extends PropsWithChildren {
    darkMode?: boolean;
}

const ThemeProviderInner: React.FC<ThemeProviderInnerProps> = ({ darkMode, children }) => {
    const sceneStyles = useSceneThemeStyle();
    const panelStyles = usePanelThemeStyle();

    return (
        <FluentProvider theme={getFluentTheme(darkMode)} style={{ ...sceneStyles, ...panelStyles }}>
            {children}
        </FluentProvider>
    );
};

const useStyles = makeStyles({
    dark: {
        colorScheme: 'dark',
    },
    light: {
        colorScheme: 'light',
        scrollbarColor: '#636363 #f2ebd9',
    },
});
