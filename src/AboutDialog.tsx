import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Link,
    makeStyles,
    typographyStyles,
} from '@fluentui/react-components';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ExternalLink } from './ExternalLink';
import { HotkeyBlockingDialogBody } from './HotkeyBlockingDialogBody';

export interface AboutDialogProps {
    className?: string;
}

export const AboutDialog: React.FC<AboutDialogProps> = (props) => {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger>
                <Link {...props}>{t('AboutDialog.DialogTrigger')}</Link>
            </DialogTrigger>
            <DialogSurface>
                <HotkeyBlockingDialogBody>
                    <DialogTitle>{t('AboutDialog.DialogTitle')}</DialogTitle>
                    <DialogContent className={classes.content}>
                        <p>
                            <Trans
                                i18nKey="AboutDialog.DialogContent.Description"
                                components={[
                                    <ExternalLink key="raidplan" href="https://raidplan.io"></ExternalLink>,
                                    <ExternalLink
                                        key="ff14Toolbox"
                                        href="https://ff14.toolboxgaming.space"
                                    ></ExternalLink>,
                                ]}
                            />
                        </p>
                        <p>
                            <Trans
                                i18nKey="AboutDialog.DialogContent.OpenSource"
                                components={[
                                    <ExternalLink
                                        key="github"
                                        href="https://github.com/joelspadin/xivplan"
                                    ></ExternalLink>,
                                    <ExternalLink
                                        key="issue"
                                        href="https://github.com/joelspadin/xivplan/issues/new/choose"
                                    ></ExternalLink>,
                                ]}
                            />
                        </p>
                        <h2>{t('AboutDialog.DialogContent.Credits')}</h2>
                        <p>XIVPlan is © 2021 Joel Spadin and contributors.</p>
                        <p>Job, role, waymark, and enemy icons are © SQUARE ENIX CO., LTD. All Rights Reserved.</p>
                        <p>
                            <ExternalLink href="https://magentalava.gumroad.com/l/limitcuticons">
                                Limit cut counter icons
                            </ExternalLink>{' '}
                            by yullanellis.
                        </p>
                        <p>
                            Some{' '}
                            <ExternalLink href="https://github.com/kotarou3/ffxiv-arena-images">
                                arena background images
                            </ExternalLink>{' '}
                            by kotarou3
                        </p>
                    </DialogContent>
                    <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">{t('AboutDialog.DialogTrigger_close')}</Button>
                        </DialogTrigger>
                    </DialogActions>
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
    );
};

const useStyles = makeStyles({
    content: {
        '& h2': typographyStyles.subtitle2,
    },
});
