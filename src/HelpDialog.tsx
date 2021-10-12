import {
    classNamesFunction,
    FontWeights,
    IButtonStyles,
    IconButton,
    IModalProps,
    IStyle,
    IStyleFunctionOrObject,
    Modal,
    Theme,
    useTheme,
} from '@fluentui/react';
import { useId } from '@fluentui/react-hooks';
import React, { useMemo } from 'react';
import { useRegisteredHotkeys } from './HotkeyHelpProvider';
import { HotkeyName } from './HotkeyName';

export const HelpDialog: React.FC<IModalProps> = (props) => {
    const theme = useTheme();
    const classNames = getClassNames(getStyles, theme);
    const buttonStyles = useMemo(() => getButtonStyles(theme), [theme]);
    const titleId = useId('title');

    return (
        <Modal titleAriaId={titleId} isBlocking={false} containerClassName={classNames.container} {...props}>
            <header className={classNames.header}>
                <span id={titleId}>Help</span>
                <IconButton
                    ariaLabel="Close help popup"
                    styles={buttonStyles}
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={() => props.onDismiss?.()}
                />
            </header>
            <div className={classNames.body}>
                <section>
                    <h2>Arena tab</h2>
                    <p>Edit the appearance of the arena here.</p>

                    <h2>Objects tab</h2>
                    <p>Drag objects onto the arena.</p>

                    <h2>Status tab</h2>
                    <p>Drag buffs and debuffs onto party members or enemies.</p>

                    <h2>Draw tab</h2>
                    <p>Draw freeform objects on the scene.</p>

                    <h2>Properties panel</h2>
                    <p>Select an object, then edit its properties here.</p>

                    <h2>Scene panel</h2>
                    <p>Displays a list of all objects in the scene.</p>
                </section>

                <section>
                    <h2>Mouse shortcuts</h2>
                    <dl>
                        <dt>Left click</dt>
                        <dd>Select object</dd>

                        <dt>
                            <HotkeyName keys="ctrl" suffix="Left click" />
                        </dt>
                        <dd>Toggle selection</dd>

                        <dt>
                            <HotkeyName keys="shift" suffix="Left click" />
                        </dt>
                        <dd>Add to selection</dd>

                        <dt>Left click + drag</dt>
                        <dd>Transform object</dd>
                    </dl>

                    <h2>Keyboard shortcuts</h2>
                    <HotkeyList />
                </section>
            </div>
        </Modal>
    );
};

const HotkeyList: React.FC = () => {
    const hotkeys = useRegisteredHotkeys();

    return (
        <dl>
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

interface IHelpDialogStyles {
    container: IStyle;
    header: IStyle;
    body: IStyle;
}

const getClassNames = classNamesFunction<Theme, IHelpDialogStyles>();

const getStyles: IStyleFunctionOrObject<Theme, IHelpDialogStyles> = (theme) => {
    return {
        container: {
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'stretch',
            maxWidth: '60vw',
        },
        header: [
            theme.fonts.xLarge,
            {
                flex: '1 1 auto',
                borderTop: `4px solid ${theme.palette.themePrimary}`,
                color: theme.palette.neutralPrimary,
                display: 'flex',
                alignItems: 'center',
                fontWeight: FontWeights.semibold,
                padding: '12px 12px 14px 24px',
            },
        ],
        body: {
            flex: '4 4 auto',
            padding: '0 24px 24px 24px',
            overflowY: 'auto',

            display: 'grid',
            gridTemplate: 'auto / 30em auto',

            section: {
                marginRight: 40,

                ':last-child': {
                    marginRight: 0,
                },
            } as IStyle,

            h2: [
                theme.fonts.mediumPlus,
                {
                    fontWeight: FontWeights.semibold,
                    marginBottom: 4,
                    '+ p': {
                        marginTop: 4,
                    } as IStyle,
                } as IStyle,
            ],

            dl: {
                display: 'grid',
                gridTemplate: 'auto / fit-content(30%) 1fr',
            } as IStyle,

            dt: {
                gridColumn: '1',
                display: 'flex',
                flexFlow: 'row',
                alignItems: 'center',
                paddingInlineStart: 4,
                paddingInlineEnd: 20,
            } as IStyle,

            dd: {
                gridColumn: '2',
                margin: 0,
                paddingInlineEnd: 16,
            } as IStyle,

            'dt, dd': {
                display: 'flex',
                flexFlow: 'row',
                alignItems: 'center',
                boxSizing: 'border-box',
                minHeight: 25,
                paddingTop: 3,
                paddingBottom: 3,

                ':nth-of-type(2n)': {
                    background: theme.palette.neutralLighterAlt,
                } as IStyle,
            } as IStyle,
        },
    };
};

const getButtonStyles = (theme: Theme): IButtonStyles => {
    return {
        root: {
            color: theme.palette.neutralPrimary,
            marginLeft: 'auto',
            marginTop: 4,
            marginRight: 2,
        },
        rootHovered: {
            color: theme.palette.neutralDark,
        },
    };
};
