import { ThemeProvider as FluentThemeProvider } from '@fluentui/react';
import { FluentProvider } from '@fluentui/react-components';
import React, { Dispatch, PropsWithChildren, createContext } from 'react';
import { useLocalStorage, useMedia } from 'react-use';
import { darkTheme, darkTheme2, lightTheme, lightTheme2 } from './themes';

export type DarkModeValue = [boolean, Dispatch<boolean>];

export const DarkModeContext = createContext<DarkModeValue>([false, () => undefined]);

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const prefersDarkMode = useMedia('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useLocalStorage('darkmode', prefersDarkMode);

    return (
        <FluentProvider theme={darkMode ? darkTheme2 : lightTheme2}>
            <FluentThemeProvider theme={darkMode ? darkTheme : lightTheme} applyTo={'body'}>
                <DarkModeContext.Provider value={[!!darkMode, setDarkMode]}>{children}</DarkModeContext.Provider>
            </FluentThemeProvider>
        </FluentProvider>
    );
};
