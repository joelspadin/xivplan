import { FluentProvider, makeStyles } from '@fluentui/react-components';
import React, { PropsWithChildren, useEffect, useMemo } from 'react';
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
        <DarkModeContext.Provider value={[!!darkMode, setDarkMode]}>
            <ThemeProviderInner darkMode={darkMode}>{children}</ThemeProviderInner>
        </DarkModeContext.Provider>
    );
};

interface ThemeProviderInnerProps extends PropsWithChildren {
    darkMode?: boolean;
}

const ThemeProviderInner: React.FC<ThemeProviderInnerProps> = ({ darkMode, children }) => {
    const sceneStyles = useSceneThemeStyle();
    const panelStyles = usePanelThemeStyle();

    const style = useMemo(
        () => ({
            ...sceneStyles,
            ...panelStyles,
        }),
        [sceneStyles, panelStyles],
    );

    return (
        <FluentProvider theme={getFluentTheme(darkMode)} style={style}>
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
