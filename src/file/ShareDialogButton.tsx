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
import React, { ReactNode, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
    const { scene } = useScene();
    const { dispatchToast } = useToastController();
    const url = useMemo(() => getSceneUrl(scene), [scene]);

    const copyToClipboard = useCallback(async () => {
        await navigator.clipboard.writeText(url);
        dispatchToast(<CopySuccessToast />, { intent: 'success' });
    }, [url, dispatchToast]);
    const { t } = useTranslation();

    return (
        <HotkeyBlockingDialogBody>
            <DialogTitle>{t('ShareDialogButton.Share')}</DialogTitle>
            <DialogContent>
                <Field label={t('ShareDialogButton.LinkPoPlan')}>
                    <Textarea value={url} contentEditable={false} appearance="filled-darker-shadow" rows={6} />
                </Field>
                <p>
                    <Trans
                        i18nKey="ShareDialogButton.ShareContent"
                        components={[<strong key="Open > Import Plan Link"></strong>]}
                    />
                </p>
            </DialogContent>
            <DialogActions fluid className={classes.actions}>
                <DownloadButton appearance="primary" className={classes.download} />

                <Button appearance="primary" icon={<CopyRegular />} onClick={copyToClipboard}>
                    {t('ShareDialogButton.CopyToClipboard')}
                </Button>

                <DialogTrigger disableButtonEnhancement>
                    <Button>{t('ShareDialogButton.Close')}</Button>
                </DialogTrigger>
            </DialogActions>
        </HotkeyBlockingDialogBody>
    );
};

const CopySuccessToast = () => {
    const { t } = useTranslation();
    return (
        <Toast>
            <ToastTitle>{t('ShareDialogButton.LinkCopied')}</ToastTitle>
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
