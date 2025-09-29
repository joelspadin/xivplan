import {
    Button,
    Dialog,
    DialogActions,
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
import React, { ReactNode } from 'react';
import { CollapsableToolbarButton } from '../CollapsableToolbarButton';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { useScene } from '../SceneProvider';
import { sceneToText } from '../file';
import { Scene } from '../scene';
import { DownloadButton } from './DownloadButton';

export interface ShareDialogButtonProps {
    children?: ReactNode | undefined;
}

export const ShareDialogButton: React.FC<ShareDialogButtonProps> = ({ children }) => {
    return (
        <Dialog>
            <DialogTrigger>
                <CollapsableToolbarButton icon={<ShareRegular />}>{children}</CollapsableToolbarButton>
            </DialogTrigger>

            <DialogSurface>
                <ShareDialogBody />
            </DialogSurface>
        </Dialog>
    );
};

const ShareDialogBody: React.FC = () => {
    const classes = useStyles();
    const { canonicalScene } = useScene();
    const { dispatchToast } = useToastController();
    const url = getSceneUrl(canonicalScene);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(url);
        dispatchToast(<CopySuccessToast />, { intent: 'success' });
    };

    return (
        <HotkeyBlockingDialogBody>
            <DialogTitle>Share</DialogTitle>
            <DialogContent>
                <Field label="Link to this plan">
                    <Textarea value={url} contentEditable={false} appearance="filled-darker" rows={6} />
                </Field>
                <p>
                    If your browser won&apos;t open the link, paste the text into{' '}
                    <strong>Open &gt; Import Plan Link</strong> instead, or download the plan and drag and drop the file
                    onto the page to open it.
                </p>
            </DialogContent>
            <DialogActions fluid className={classes.actions}>
                <DownloadButton appearance="primary" className={classes.download} />

                <Button appearance="primary" icon={<CopyRegular />} onClick={copyToClipboard}>
                    Copy to clipboard
                </Button>

                <DialogTrigger disableButtonEnhancement>
                    <Button>Close</Button>
                </DialogTrigger>
            </DialogActions>
        </HotkeyBlockingDialogBody>
    );
};

const CopySuccessToast = () => {
    return (
        <Toast>
            <ToastTitle>Link copied</ToastTitle>
        </Toast>
    );
};

function getSceneUrl(scene: Scene) {
    const data = sceneToText(scene);
    return `${location.protocol}//${location.host}${location.pathname}#/plan/${data}`;
}

const useStyles = makeStyles({
    actions: {
        width: '100%',
    },
    download: {
        marginRight: 'auto',
    },
});
