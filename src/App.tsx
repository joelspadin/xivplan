import { classNamesFunction, Theme, useTheme } from '@fluentui/react';
import { IStyle } from '@fluentui/style-utilities';
import React from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { HelpProvider } from './HelpProvider';
import { MainPage } from './MainPage';
import { SiteHeader, SiteHeaderHeight } from './SiteHeader';
import { ThemeProvider } from './ThemeProvider';

interface IAppStyles {
    root: IStyle;
    contentWrapper: IStyle;
}

const getClassNames = classNamesFunction<Theme, IAppStyles>();

function getStyles(theme: Theme): IAppStyles {
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
}

export const BaseProviders: React.FC = ({ children }) => {
    return (
        <ThemeProvider>
            <HelpProvider>{children}</HelpProvider>
        </ThemeProvider>
    );
};

const Layout: React.FunctionComponent = () => {
    const theme = useTheme();
    const classNames = getClassNames(getStyles, theme);

    return (
        <BaseProviders>
            <div className={classNames.root}>
                <SiteHeader />
                <div className={classNames.contentWrapper}>
                    <div>
                        <Outlet />
                    </div>
                </div>
            </div>
        </BaseProviders>
    );
};

export const App: React.FunctionComponent = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<MainPage />} />
            </Route>
        </Routes>
    );
};
