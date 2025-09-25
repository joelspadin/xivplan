import {
    Button,
    Dialog,
    DialogContent,
    DialogProps,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    makeStyles,
    tokens,
    typographyStyles,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { HotkeyBlockingDialogBody } from './HotkeyBlockingDialogBody';
import { HotkeyName } from './HotkeyName';
import { useRegisteredHotkeys } from './useHotkeys';

export type HelpDialogProps = Omit<DialogProps, 'children'>;

export const HelpDialog: React.FC<HelpDialogProps> = (props) => {
    const classes = useStyles();
    const { t } = useTranslation();
    return (
        <Dialog {...props}>
            <DialogSurface className={classes.surface}>
                <HotkeyBlockingDialogBody>
                    <DialogTitle
                        action={
                            <DialogTrigger action="close">
                                <Button appearance="subtle" aria-label="close" icon={<Dismiss24Regular />} />
                            </DialogTrigger>
                        }
                    >
                        {t('HelpDialog.DialogTitle')}
                    </DialogTitle>
                    <DialogContent className={classes.content}>
                        <section className={classes.section}>
                            <h2>{t('HelpDialog.DialogContent.LeftPanel')}</h2>
                            <h3>{t('HelpDialog.DialogContent.Arena')}</h3>
                            <p>{t('HelpDialog.DialogContent.Arena_Description')}</p>

                            <h3>{t('HelpDialog.DialogContent.Objects')}</h3>
                            <p>{t('HelpDialog.DialogContent.Objects_Description')}</p>

                            <h3>{t('HelpDialog.DialogContent.Icons')}</h3>
                            <p>{t('HelpDialog.DialogContent.Icons_Description')}</p>

                            <h3>{t('HelpDialog.DialogContent.Draw')}</h3>
                            <p>{t('HelpDialog.DialogContent.Draw_Description')}</p>

                            <h2>{t('HelpDialog.DialogContent.RightPanel')}</h2>
                            <h3>{t('HelpDialog.DialogContent.Properties')}</h3>
                            <p>{t('HelpDialog.DialogContent.Properties_Description')}</p>

                            <h3>{t('HelpDialog.DialogContent.Scene')}</h3>
                            <p>{t('HelpDialog.DialogContent.Scene_Description')}</p>
                        </section>

                        <section className={classes.section}>
                            <h2>{t('HelpDialog.DialogContent.KeyboardShortcuts')}</h2>
                            <HotkeyList />
                        </section>

                        <section className={classes.section}>
                            <h2>{t('HelpDialog.DialogContent.MouseShortcuts')}</h2>
                            <dl className={classes.hotkeys}>
                                <dt>{t('HelpDialog.DialogContent.LeftClick')}</dt>
                                <dd>{t('HelpDialog.DialogContent.LeftClick_Description')}</dd>

                                <dt>
                                    <HotkeyName keys="ctrl" suffix={t('HelpDialog.DialogContent.LeftClick')} />
                                </dt>
                                <dd>{t('HelpDialog.DialogContent.ToggleSelection')}</dd>

                                <dt>
                                    <HotkeyName keys="shift" suffix={t('HelpDialog.DialogContent.LeftClick')} />
                                </dt>
                                <dd>{t('HelpDialog.DialogContent.AddToSelection')}</dd>

                                <dt>{t('HelpDialog.DialogContent.LeftClick&Drag')}</dt>
                                <dd>{t('HelpDialog.DialogContent.LeftClick&Drag_Description')}</dd>

                                <dt>
                                    <HotkeyName keys="shift" suffix={t('HelpDialog.DialogContent.LeftClick&Drag')} />
                                </dt>
                                <dd>{t('HelpDialog.DialogContent.ProportionalResize')}</dd>
                            </dl>
                        </section>
                    </DialogContent>
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
    );
};

const HotkeyList: React.FC = () => {
    const classes = useStyles();
    const hotkeys = useRegisteredHotkeys();

    return (
        <dl className={classes.hotkeys}>
            {hotkeys.map((info, i) => (
                <React.Fragment key={i}>
                    <dt>
                        <HotkeyName keys={info.keys} />
                    </dt>
                    <dd>{info.help}</dd>
                </React.Fragment>
            ))}
        </dl>
    );
};

const useStyles = makeStyles({
    surface: {
        maxWidth: 'fit-content',
    },
    content: {
        display: 'grid',
        gridTemplate: 'auto / minmax(15em, 25em) repeat(2, minmax(20em, auto))',
        columnGap: tokens.spacingHorizontalXXXL,
        ...typographyStyles.body1,

        '@media (max-width: 992px)': {
            display: 'flex',
            flexFlow: 'column',
        },

        '& h2': {
            ...typographyStyles.subtitle1,
            fontWeight: tokens.fontWeightRegular,

            marginTop: tokens.spacingVerticalS,
            marginBottom: tokens.spacingVerticalM,
            background: tokens.colorNeutralBackground1,
        },
        '& h3': {
            ...typographyStyles.subtitle2,
            marginBottom: tokens.spacingVerticalS,
        },

        '& h3 + p': {
            marginTop: 0,
        },
    },
    section: {},
    hotkeys: {
        display: 'grid',
        gridTemplate: 'auto / fit-content(30%) 1fr',

        overflow: 'auto',
        maxHeight: 'calc(100vh - 48px - 48px - 8px - 48px)',
        marginTop: 0,

        '@media (max-width: 992px)': {
            maxHeight: 'unset',
        },

        '& dt': {
            gridColumn: '1',
            display: 'flex',
            flexFlow: 'row',
            alignItems: 'center',
            paddingInlineStart: tokens.spacingHorizontalXS,
            paddingInlineEnd: tokens.spacingHorizontalL,
        },

        '& dd': {
            gridColumn: '2',
            margin: 0,
            paddingInlineEnd: tokens.spacingHorizontalXL,
        },

        '& dt, dd': {
            display: 'flex',
            flexFlow: 'row',
            alignItems: 'center',
            boxSizing: 'border-box',
            minHeight: '28px',

            ':nth-of-type(2n)': {
                background: tokens.colorNeutralBackgroundAlpha,
            },
        },
    },
});
