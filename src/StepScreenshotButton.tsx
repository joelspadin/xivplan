import {
    makeStyles,
    Portal,
    Toast,
    ToastTitle,
    ToolbarButtonProps,
    useToastController,
} from '@fluentui/react-components';
import { ScreenshotRegular } from '@fluentui/react-icons';
import Konva from 'konva';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTimeoutFn } from 'react-use';
import { CollapsableToolbarButton } from './CollapsableToolbarButton';
import { getCanvasSize } from './coord';
import { MessageToast } from './MessageToast';
import { ObjectLoadingContext } from './ObjectLoadingContext';
import { ObjectLoadingProvider } from './ObjectLoadingProvider';
import { ScenePreview } from './render/SceneRenderer';
import { useScene } from './SceneProvider';
import { DarkModeContext } from './ThemeContext';
import { getTheme } from './themes';
import { useHotkeys } from './useHotkeys';

const SCREENSHOT_TIMEOUT = 1000;

export type StepScreenshotButtonProps = ToolbarButtonProps;

export const StepScreenshotButton: React.FC<StepScreenshotButtonProps> = (props) => {
    const classes = useStyles();
    const [takingScreenshot, setTakingScreenshot] = useState(false);
    const { dispatchToast } = useToastController();

    const handleScreenshotDone = useCallback(
        (error?: unknown) => {
            setTakingScreenshot(false);

            if (error) {
                dispatchToast(<MessageToast title="Error" message={error} />, { intent: 'error' });
            } else {
                dispatchToast(<ScreenshotSuccessToast />, { intent: 'success', timeout: 2000 });
            }
        },
        [dispatchToast, setTakingScreenshot],
    );

    // Cancel the screenshot if it takes too long so it can't get stuck.
    const handleTimeout = useCallback(() => {
        if (!takingScreenshot) {
            return;
        }

        setTakingScreenshot(false);
        dispatchToast(<MessageToast title="Error" message="Screenshot timed out" />, { intent: 'error' });
    }, [takingScreenshot, dispatchToast, setTakingScreenshot]);

    const [, , startTimeout] = useTimeoutFn(handleTimeout, SCREENSHOT_TIMEOUT);

    const startScreenshot = useCallback(() => {
        setTakingScreenshot(true);
        startTimeout();
    }, [setTakingScreenshot, startTimeout]);

    useHotkeys(
        'ctrl+shift+c',
        '7.Steps',
        'Screenshot current step',
        (ev) => {
            setTakingScreenshot(true);
            ev.preventDefault();
        },
        [setTakingScreenshot],
    );

    return (
        <>
            <CollapsableToolbarButton
                {...props}
                icon={<ScreenshotRegular />}
                disabled={takingScreenshot}
                onClick={startScreenshot}
            />
            {takingScreenshot && (
                <Portal mountNode={{ className: classes.screenshot }}>
                    <ObjectLoadingProvider>
                        <ScreenshotComponent onScreenshotDone={handleScreenshotDone} />
                    </ObjectLoadingProvider>
                </Portal>
            )}
        </>
    );
};

const ScreenshotSuccessToast = () => {
    return (
        <Toast>
            <ToastTitle>Screenshot copied to clipboard</ToastTitle>
        </Toast>
    );
};

interface ScreenshotComponentProps {
    onScreenshotDone: (error?: unknown) => void;
}

const ScreenshotComponent: React.FC<ScreenshotComponentProps> = ({ onScreenshotDone }) => {
    const { isLoading } = useContext(ObjectLoadingContext);
    const { scene, stepIndex } = useScene();
    const [frozenScene] = useState(scene);
    const [frozenStepIndex] = useState(stepIndex);
    const [darkMode] = useContext(DarkModeContext);
    const ref = useRef<Konva.Stage>(null);

    const takeScreenshot = useCallback(async () => {
        try {
            if (!ref.current) {
                throw new Error('Stage missing');
            }

            await copyToClipboard(ref.current);
            onScreenshotDone();
        } catch (ex) {
            onScreenshotDone(ex);
        }
    }, [onScreenshotDone]);

    // Delay screenshot by at least one render to make sure any objects that need
    // to load resources have reported that they are loading.
    const [firstRender, setFirstRender] = useState(true);
    useEffect(() => {
        setFirstRender(false);
    }, [setFirstRender]);

    // Avoid double screenshot in development builds.
    const screenshotTaken = useRef(false);

    useEffect(() => {
        if (!firstRender && !isLoading && !screenshotTaken.current) {
            takeScreenshot();

            return () => {
                screenshotTaken.current = true;
            };
        }
    }, [firstRender, isLoading, takeScreenshot]);

    const size = getCanvasSize(frozenScene);
    const theme = getTheme(darkMode);

    return (
        <ScenePreview
            ref={ref}
            backgroundColor={theme.colorNeutralBackground1}
            scene={frozenScene}
            stepIndex={frozenStepIndex}
            width={size.width}
            height={size.height}
        />
    );
};

async function copyToClipboard(stage: Konva.Stage) {
    const blob = (await stage.toBlob({ mimeType: 'image/png' })) as Blob;

    await navigator.clipboard.write([
        new ClipboardItem({
            [blob.type]: blob,
        }),
    ]);
}

const useStyles = makeStyles({
    screenshot: {
        visibility: 'hidden',
    },
});
