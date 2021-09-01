import { classNamesFunction, Theme, useTheme } from '@fluentui/react';
import { IStyle } from '@fluentui/style-utilities';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import { Routes } from './Routes';
import { SiteHeader, SiteHeaderHeight } from './SiteHeader';
import { ThemeProvider } from './ThemeProvider';

interface IAppStyles {
    header: IStyle;
    contentWrapper: IStyle;
    content: IStyle;
}

const getClassNames = classNamesFunction<Theme, IAppStyles>();

const Content: React.FunctionComponent = () => {
    const theme = useTheme();
    const classNames = getClassNames(() => {
        return {
            header: {},
            contentWrapper: {
                position: 'absolute',
                top: SiteHeaderHeight,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
            },
            content: {},
        };
    }, theme);

    return (
        <div>
            <SiteHeader className={classNames.header} />
            <div className={classNames.contentWrapper}>
                <div className={classNames.content}>
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
                <Content />
            </ThemeProvider>
        </Router>
    );
};
