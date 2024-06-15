import { ThemeProvider as FluentThemeProvider } from '@fluentui/react';
import { FluentProvider, makeStyles } from '@fluentui/react-components';
import React, { Dispatch, PropsWithChildren, createContext, useEffect } from 'react';
import { useLocalStorage, useMedia } from 'react-use';
import { darkTheme, darkTheme2, lightTheme, lightTheme2 } from './themes';

export type DarkModeValue = [boolean, Dispatch<boolean>];

export const DarkModeContext = createContext<DarkModeValue>([false, () => undefined]);

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const prefersDarkMode = useMedia('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useLocalStorage('darkmode', prefersDarkMode);
    const classes = useStyles();

    // TODO: remove this hack once https://github.com/microsoft/fluentui/issues/31211 is implemented.
    useEffect(() => {
        document.documentElement.className = darkMode ? classes.dark : classes.light;
    }, [classes, darkMode]);

    return (
        <FluentProvider theme={darkMode ? darkTheme2 : lightTheme2}>
            <FluentThemeProvider theme={darkMode ? darkTheme : lightTheme} applyTo={'body'}>
                <DarkModeContext.Provider value={[!!darkMode, setDarkMode]}>{children}</DarkModeContext.Provider>
            </FluentThemeProvider>
        </FluentProvider>
    );
};

const useStyles = makeStyles({
    dark: {
        colorScheme: 'dark',
    },
    light: {
        colorScheme: 'light',
    },
});
