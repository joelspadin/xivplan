import { ThemeProvider as FluentThemeProvider } from '@fluentui/react';
import React, { createContext, Dispatch } from 'react';
import { useLocalStorage, useMedia } from 'react-use';
import { darkTheme, lightTheme } from './themes';

export type DarkModeValue = [boolean, Dispatch<boolean>];

export const DarkModeContext = createContext<DarkModeValue>([false, () => undefined]);

export const ThemeProvider: React.FunctionComponent = ({ children }) => {
    const prefersDarkMode = useMedia('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useLocalStorage('darkmode', prefersDarkMode);

    return (
        <FluentThemeProvider theme={darkMode ? darkTheme : lightTheme} applyTo={'body'}>
            <DarkModeContext.Provider value={[!!darkMode, setDarkMode]}>{children}</DarkModeContext.Provider>
        </FluentThemeProvider>
    );
};
