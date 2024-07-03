import { makeStyles, Toaster, tokens } from '@fluentui/react-components';
import React, { PropsWithChildren, useMemo } from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Outlet,
    Route,
    RouterProvider,
    useLocation,
    useSearchParams,
} from 'react-router-dom';
import { DirtyProvider } from './DirtyProvider';
import { parseSceneLink } from './file/share';
import { FileOpenPage } from './FileOpenPage';
import { HelpProvider } from './HelpProvider';
import { MainPage } from './MainPage';
import { SceneProvider } from './SceneProvider';
import { SiteHeader } from './SiteHeader';
import { ThemeProvider } from './ThemeProvider';
import { useFileLoaderDropTarget } from './useFileLoader';
import { HotkeyScopes } from './useHotkeys';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'grid',
        gridTemplateColumns: `auto minmax(400px, auto) 1fr`,
        gridTemplateRows: `min-content min-content 1fr`,
        gridTemplateAreas: `
                "header     header  header"
                "left-panel steps   right-panel"
                "left-panel content right-panel"
            `,

        background: tokens.colorNeutralBackground3,
    },
    header: {
        gridArea: 'header',
    },
});

export const BaseProviders: React.FC<PropsWithChildren> = ({ children }) => {
    const [searchParams] = useSearchParams();
    const { hash } = useLocation();

    const sceneFromLink = useMemo(() => {
        try {
            return parseSceneLink(hash, searchParams);
        } catch (ex) {
            console.error('Invalid plan data from URL', ex);
        }
    }, [hash, searchParams]);

    return (
        <ThemeProvider>
            <HotkeysProvider initiallyActiveScopes={[HotkeyScopes.Default, HotkeyScopes.AlwaysEnabled]}>
                <HelpProvider>
                    <SceneProvider initialScene={sceneFromLink}>
                        <DirtyProvider>{children}</DirtyProvider>
                    </SceneProvider>
                </HelpProvider>
            </HotkeysProvider>
        </ThemeProvider>
    );
};

const Layout: React.FC = () => {
    return (
        <BaseProviders>
            <Root />
        </BaseProviders>
    );
};

const Root: React.FC = () => {
    const classes = useStyles();
    const { onDragOver, onDrop, renderModal } = useFileLoaderDropTarget();

    return (
        <>
            <div className={classes.root} onDragOver={onDragOver} onDrop={onDrop}>
                <Toaster position="top" />
                <SiteHeader className={classes.header} />
                <Outlet />
            </div>
            {renderModal()}
        </>
    );
};

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route path="open" element={<FileOpenPage />} />
        </Route>,
    ),
);

export const App: React.FC = () => {
    return <RouterProvider router={router} />;
};
