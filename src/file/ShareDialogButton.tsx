import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Field,
    Textarea,
    Toast,
    ToastTitle,
    makeStyles,
    useToastController,
} from '@fluentui/react-components';
import { CopyRegular, ShareRegular } from '@fluentui/react-icons';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { CollapsableToolbarButton } from '../CollapsableToolbarButton';
import { useScene } from '../SceneProvider';
import { sceneToText } from '../file';
import { Scene } from '../scene';

export interface ShareDialogButtonProps {
    children?: ReactNode | undefined;
}

export const ShareDialogButton: React.FC<ShareDialogButtonProps> = ({ children }) => {
    const { scene } = useScene();
    const { dispatchToast } = useToastController();
    const url = useMemo(() => getSceneUrl(scene), [scene]);
    const classes = useStyles();

    // TODO: create toast when copy button is clicked. Anchor toast to dialog?

    const copyToClipboard = useCallback(async () => {
        await navigator.clipboard.writeText(url);
        dispatchToast(<CopySuccessToast />, { intent: 'success' });
    }, [url, dispatchToast]);

    return (
        <Dialog>
            <DialogTrigger>
                <CollapsableToolbarButton icon={<ShareRegular />}>{children}</CollapsableToolbarButton>
            </DialogTrigger>

            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Share</DialogTitle>
                    <DialogContent>
                        <Field label="Link to this plan">
                            <Textarea
                                value={url}
                                contentEditable={false}
                                appearance="filled-darker-shadow"
                                className={classes.textarea}
                            />
                        </Field>
                        <p>
                            If the link is too long for your browser to open, paste the text into{' '}
                            <strong>Open &gt; Import Plan Link</strong> instead.
                        </p>
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="primary" icon={<CopyRegular />} onClick={copyToClipboard}>
                            Copy to clipboard
                        </Button>

                        <DialogTrigger disableButtonEnhancement>
                            <Button>Close</Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

const CopySuccessToast = () => {
    return (
        <Toast>
            <ToastTitle>Link copied</ToastTitle>
        </Toast>
    );
};

const useStyles = makeStyles({
    textarea: {
        minHeight: '10em',
    },
});

function getSceneUrl(scene: Scene) {
    const data = sceneToText(scene);
    return `${location.protocol}//${location.host}${location.pathname}#/plan/${data}`;
}
