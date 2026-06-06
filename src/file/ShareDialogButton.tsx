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
import React, { type ReactNode } from 'react';
import { CollapsableToolbarButton } from '../CollapsableToolbarButton';
import { HotkeyBlockingDialogBody } from '../HotkeyBlockingDialogBody';
import { useScene } from '../SceneProvider';
import { sceneToText } from '../file';
import type { Scene } from '../scene';
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
                    This link contains the entire plan data. If it is too large, you can download the plan as a file and
                    share that instead. Drag and drop a .xivplan file onto the page to open it. If your browser supports
                    installing this site as an app, you can also open the file directly.
                </p>
                <p>
                    If you host a .xivplan file on a public web server, you can share a link to{' '}
                    <a href="https://xivplan.netlify.app/?url=">https://xivplan.netlify.app/?url=</a> followed by the
                    URL of the file.
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
