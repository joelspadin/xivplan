import { IModalProps, IStyle, IStyleFunctionOrObject, Theme } from '@fluentui/react';
import React from 'react';
import { BaseDialog, IBaseDialogStyles } from './BaseDialog';
import { useRegisteredHotkeys } from './HotkeyHelpProvider';
import { HotkeyName } from './HotkeyName';

export const HelpDialog: React.FC<IModalProps> = (props) => {
    return (
        <BaseDialog headerText="Help" {...props} dialogStyles={getStyles}>
            <section>
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

            <section>
                <h2>Keyboard shortcuts</h2>
                <HotkeyList />
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
                    <dd>Move/transform object</dd>
                </dl>
            </section>
        </BaseDialog>
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

const getStyles: IStyleFunctionOrObject<Theme, IBaseDialogStyles> = (theme) => {
    return {
        body: {
            display: 'grid',
            gridTemplate: 'auto / minmax(15em, 30em) repeat(2, minmax(20em, auto))',

            section: {
                marginRight: 40,

                ':last-child': {
                    marginRight: 0,
                },
            } as IStyle,

            '@media (max-width: 992px)': {
                display: 'flex',
                flexFlow: 'column',
            } as IStyle,

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
