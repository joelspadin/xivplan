import { classNamesFunction, Theme, useTheme } from '@fluentui/react';
import { IStyle } from '@fluentui/style-utilities';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelpProvider } from './HelpProvider';
import { Routes } from './Routes';
import { SiteHeader, SiteHeaderHeight } from './SiteHeader';
import { ThemeProvider } from './ThemeProvider';

interface IAppStyles {
    root: IStyle;
    contentWrapper: IStyle;
}

const getClassNames = classNamesFunction<Theme, IAppStyles>();

const Content: React.FunctionComponent = () => {
    const theme = useTheme();
    const classNames = getClassNames(() => {
        return {
            root: {
                colorScheme: theme.isInverted ? 'dark' : 'light',
            },
            contentWrapper: {
                position: 'absolute',
                top: SiteHeaderHeight,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
            },
        };
    }, theme);

    return (
        <div className={classNames.root}>
            <SiteHeader />
            <div className={classNames.contentWrapper}>
                <div>
                    <Routes />
                </div>
            </div>
        </div>
    );
};

export const App: React.FunctionComponent = () => {
    return (
        <Router>
            <ThemeProvider>
                <HelpProvider>
                    <Content />
                </HelpProvider>
            </ThemeProvider>
        </Router>
    );
};
