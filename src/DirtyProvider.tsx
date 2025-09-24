import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogProps,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
} from '@fluentui/react-components';
import { Action } from 'history';
import React, { PropsWithChildren, useCallback, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Location, useNavigate } from 'react-router-dom';
import { useBeforeUnload } from 'react-use';
import { DirtyContext, SavedStateContext } from './DirtyContext';
import { useScene } from './SceneProvider';
import { Scene } from './scene';

export const DirtyProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { scene } = useScene();
    const [savedState, setSavedState] = useState<Scene>(scene);
    const isDirty = scene !== savedState;

    return (
        <SavedStateContext.Provider value={setSavedState}>
            <DirtyContext.Provider value={isDirty}>
                {children}

                <NavLockPrompt locked={isDirty} />
            </DirtyContext.Provider>
        </SavedStateContext.Provider>
    );
};

interface NavLockProps {
    locked: boolean;
}

interface NextLocation {
    location: Location;
    action: Action;
}

type OpenChangeEventHandler = Required<DialogProps>['onOpenChange'];

const NavLockPrompt: React.FC<NavLockProps> = ({ locked }) => {
    const { t } = useTranslation();
    const NAV_LOCK_MESSAGE = t('translation.DirtyProvider.NAV_LOCK_MESSAGE');
    useBeforeUnload(locked, NAV_LOCK_MESSAGE);

    const confirmId = useId();
    const navigate = useNavigate();
    // const currentLocation = useLocation();

    const [showDialog, setShowDialog] = useState(false);
    const [nextLocation, setNextLocation] = useState<NextLocation>();

    // TODO: https://github.com/remix-run/react-router/issues/8139
    // const onPrompt = useCallback(
    //     (location: Location, action: Action) => {
    //         if (location.pathname === currentLocation.pathname) {
    //             return true;
    //         }

    //         setNextLocation({ location, action });
    //         setShowDialog(true);
    //         return false;
    //     },
    //     [setNextLocation, showDialog],
    // );

    const onCancelNavigate = useCallback(() => {
        setNextLocation(undefined);
        setShowDialog(false);
    }, [setNextLocation, setShowDialog]);

    const onConfirmNavigate = useCallback(() => {
        setShowDialog(false);

        if (!nextLocation) {
            return;
        }

        switch (nextLocation.action) {
            case Action.Pop:
                navigate(-1);
                break;

            case Action.Push:
                navigate(nextLocation.location);
                break;

            case Action.Replace:
                navigate(nextLocation.location, { replace: true });
                break;
        }
    }, [nextLocation, setShowDialog, navigate]);

    const onOpenChange = useCallback<OpenChangeEventHandler>(
        (ev, data) => {
            if (!data.open) {
                const target = ev.target as HTMLElement;
                if (target.id === confirmId) {
                    onConfirmNavigate();
                } else {
                    onCancelNavigate();
                }
            }
        },
        [confirmId, onConfirmNavigate, onCancelNavigate],
    );

    return (
        <>
            {/* <Prompt when={locked && !nextLocation} message={onPrompt} /> */}
            <Dialog open={showDialog} onOpenChange={onOpenChange}>
                <DialogSurface>
                    <DialogTitle>{t('DirtyProvider.DialogTitle')}</DialogTitle>
                    <DialogContent>{NAV_LOCK_MESSAGE}</DialogContent>
                    <DialogActions>
                        <DialogTrigger>
                            <Button id={confirmId} appearance="primary">
                                {t('DirtyProvider.DialogTrigger1')}
                            </Button>
                        </DialogTrigger>
                        <DialogTrigger>
                            <Button>{t('DirtyProvider.DialogTrigger2')}</Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogSurface>
            </Dialog>
        </>
    );
};
