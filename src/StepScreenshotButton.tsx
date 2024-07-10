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
import React, { useCallback, useContext, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { CollapsableToolbarButton } from './CollapsableToolbarButton';
import { getCanvasSize } from './coord';
import { MessageToast } from './MessageToast';
import { ScenePreview } from './render/SceneRenderer';
import { useScene } from './SceneProvider';
import { DarkModeContext } from './ThemeProvider';
import { getTheme } from './themes';
import { useHotkeys } from './useHotkeys';

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
                onClick={() => setTakingScreenshot(true)}
            />
            {takingScreenshot && (
                <Portal mountNode={{ className: classes.screenshot }}>
                    <ScreenshotComponent onScreenshotDone={handleScreenshotDone} />
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
    const { scene, stepIndex } = useScene();
    const ref = useRef<Konva.Stage>(null);
    const [darkMode] = useContext(DarkModeContext);

    const takeScreenshot = useCallback(async () => {
        try {
            // TODO: replace this delay with some sort of counter on the number of loading images.
            // Make a new hook that wraps useImage() and keeps a reference count or set of image URLs?
            // Also have a timeout in case an image is stuck loading.
            await new Promise((resolve) => {
                setTimeout(resolve, 500);
            });

            if (!ref.current) {
                throw new Error('Stage missing');
            }

            await copyToClipboard(ref.current);
            onScreenshotDone();
        } catch (ex) {
            onScreenshotDone(ex);
        }
    }, [onScreenshotDone]);

    // Avoid double screenshot in development builds.
    const screenshotTaken = useRef(false);

    useEffectOnce(() => {
        if (!screenshotTaken.current) {
            takeScreenshot();

            return () => {
                screenshotTaken.current = true;
            };
        }
    });

    const size = getCanvasSize(scene);
    const theme = getTheme(darkMode);

    return (
        <ScenePreview
            ref={ref}
            backgroundColor={theme.colorNeutralBackground1}
            scene={scene}
            stepIndex={stepIndex}
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
