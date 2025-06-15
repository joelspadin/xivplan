import {
    makeStyles,
    Menu,
    MenuButtonProps,
    MenuCheckedValueChangeData,
    MenuCheckedValueChangeEvent,
    MenuGroup,
    MenuGroupHeader,
    MenuItemRadio,
    MenuList,
    MenuPopover,
    MenuTrigger,
    Portal,
    SplitButtonProps,
    Toast,
    ToastTitle,
    useToastController,
} from '@fluentui/react-components';
import { ScreenshotRegular } from '@fluentui/react-icons';
import Konva from 'konva';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocalStorage, useTimeoutFn } from 'react-use';
import { CollapsableSplitButton } from './CollapsableToolbarButton';
import { getCanvasSize } from './coord';
import { MessageToast } from './MessageToast';
import { ObjectLoadingContext } from './ObjectLoadingContext';
import { ObjectLoadingProvider } from './ObjectLoadingProvider';
import { ScenePreview } from './render/SceneRenderer';
import { useScene } from './SceneProvider';
import { useHotkeys } from './useHotkeys';

const SCREENSHOT_TIMEOUT = 1000;

export type StepScreenshotButtonProps = SplitButtonProps;

export const StepScreenshotButton: React.FC<StepScreenshotButtonProps> = (props) => {
    const classes = useStyles();
    const [scale, setScale] = useLocalStorage('screenshotPixelRatio', 1);
    const [takingScreenshot, setTakingScreenshot] = useState(false);
    const { dispatchToast } = useToastController();

    const checkedValues: Record<string, string[]> = {
        scale: [scale?.toString() ?? '1'],
    };

    const handleCheckedValueChanged = useCallback(
        (e: MenuCheckedValueChangeEvent, data: MenuCheckedValueChangeData) => {
            if (data.name === 'scale') {
                setScale(parseInt(data.checkedItems?.[0] ?? '1'));
            }
        },
        [setScale],
    );

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
        { category: '7.Steps', help: 'Screenshot current step' },
        (ev) => {
            setTakingScreenshot(true);
            ev.preventDefault();
        },
        [setTakingScreenshot],
    );

    return (
        <>
            <Menu
                positioning="below-end"
                checkedValues={checkedValues}
                onCheckedValueChange={handleCheckedValueChanged}
            >
                <MenuTrigger disableButtonEnhancement>
                    {(triggerProps: MenuButtonProps) => (
                        <CollapsableSplitButton
                            {...props}
                            menuButton={triggerProps}
                            primaryActionButton={{ onClick: startScreenshot, disabled: takingScreenshot }}
                            icon={<ScreenshotRegular />}
                            appearance="subtle"
                        />
                    )}
                </MenuTrigger>
                <MenuPopover>
                    <MenuList>
                        <MenuGroup>
                            <MenuGroupHeader>Screenshot scale</MenuGroupHeader>
                            <MenuItemRadio name="scale" value="1">
                                1X
                            </MenuItemRadio>
                            <MenuItemRadio name="scale" value="2">
                                2X
                            </MenuItemRadio>
                            <MenuItemRadio name="scale" value="4">
                                4X
                            </MenuItemRadio>
                        </MenuGroup>
                    </MenuList>
                </MenuPopover>
            </Menu>
            {takingScreenshot && (
                <Portal mountNode={{ className: classes.screenshot }}>
                    <ObjectLoadingProvider>
                        <ScreenshotComponent scale={scale} onScreenshotDone={handleScreenshotDone} />
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
    scale?: number;
    onScreenshotDone: (error?: unknown) => void;
}

const ScreenshotComponent: React.FC<ScreenshotComponentProps> = ({ scale, onScreenshotDone }) => {
    const { isLoading } = useContext(ObjectLoadingContext);
    const { scene, stepIndex } = useScene();
    const [frozenScene] = useState(scene);
    const [frozenStepIndex] = useState(stepIndex);
    const ref = useRef<Konva.Stage>(null);

    const takeScreenshot = useCallback(async () => {
        try {
            if (!ref.current) {
                throw new Error('Stage missing');
            }

            await copyToClipboard(ref.current, scale);
            onScreenshotDone();
        } catch (ex) {
            onScreenshotDone(ex);
        }
    }, [scale, onScreenshotDone]);

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

    return (
        <ScenePreview
            ref={ref}
            scene={frozenScene}
            stepIndex={frozenStepIndex}
            width={size.width}
            height={size.height}
        />
    );
};

async function copyToClipboard(stage: Konva.Stage, pixelRatio = 2) {
    const blob = (await stage.toBlob({ mimeType: 'image/png', pixelRatio })) as Blob;

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
