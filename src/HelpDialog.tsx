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
import { HotkeyBlockingDialogBody } from './HotkeyBlockingDialogBody';
import { HotkeyName } from './HotkeyName';
import { useRegisteredHotkeys } from './useHotkeys';

export type HelpDialogProps = Omit<DialogProps, 'children'>;

export const HelpDialog: React.FC<HelpDialogProps> = (props) => {
    const classes = useStyles();

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
                        Help
                    </DialogTitle>
                    <DialogContent className={classes.content}>
                        <section className={classes.section}>
                            <h2>Left panel</h2>
                            <h3>Arena</h3>
                            <p>Edit the appearance of the arena here.</p>

                            <h3>Objects</h3>
                            <p>Drag objects onto the arena.</p>

                            <h3>Icons</h3>
                            <p>Drag markers and status effect icons onto the arena.</p>

                            <h3>Draw</h3>
                            <p>Draw freeform objects on the scene.</p>

                            <h2>Right panel</h2>
                            <h3>Properties</h3>
                            <p>Select an object, then edit its properties here.</p>

                            <h3>Scene</h3>
                            <p>Displays a list of all objects in the scene. Drag and drop to adjust layering order.</p>
                        </section>

                        <section className={classes.section}>
                            <h2>Keyboard shortcuts</h2>
                            <HotkeyList />
                        </section>

                        <section className={classes.section}>
                            <h2>Mouse shortcuts</h2>
                            <dl className={classes.hotkeys}>
                                <dt>Left click</dt>
                                <dd>Select object</dd>

                                <dt>
                                    <HotkeyName keys="ctrl" suffix="left click" />
                                </dt>
                                <dd>Toggle selection</dd>

                                <dt>
                                    <HotkeyName keys="shift" suffix="left click" />
                                </dt>
                                <dd>Add to selection</dd>

                                <dt>Left click + drag</dt>
                                <dd>Move/transform object</dd>

                                <dt>
                                    <HotkeyName keys="shift" suffix="left click + drag" />
                                </dt>
                                <dd>Proportional resize</dd>
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
