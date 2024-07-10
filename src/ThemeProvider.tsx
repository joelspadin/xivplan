import { FluentProvider, makeStyles } from '@fluentui/react-components';
import React, { Dispatch, PropsWithChildren, createContext, useEffect } from 'react';
import { useLocalStorage, useMedia } from 'react-use';
import { getTheme } from './themes';

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
        <FluentProvider theme={getTheme(darkMode)}>
            <DarkModeContext.Provider value={[!!darkMode, setDarkMode]}>{children}</DarkModeContext.Provider>
        </FluentProvider>
    );
};

const useStyles = makeStyles({
    dark: {
        colorScheme: 'dark',
    },
    light: {
        colorScheme: 'light',
        scrollbarColor: '#636363 #f2e0c9',
    },
});
