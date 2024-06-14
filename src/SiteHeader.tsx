import { IToggleStyles } from '@fluentui/react';
import { Link, Switch, Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import React, { HTMLAttributes, useContext } from 'react';
import { AboutDialog } from './AboutDialog';
import { CommandBarContext } from './CommandBarProvider';
import { ExternalLink } from './ExternalLink';
import { HelpContext } from './HelpProvider';
import { DarkModeContext } from './ThemeProvider';
import logoUrl from './logo.svg';

const HEADER_HEIGHT = '48px';

const toggleStyles: Partial<IToggleStyles> = {
    root: { marginBottom: 0 },
    label: {
        paddingTop: 4,
    },
};

const useClasses = makeStyles({
    root: {
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'center',
        columnGap: '20px',
        minHeight: HEADER_HEIGHT,
        paddingInlineEnd: '30px',
    },
    brand: {
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        display: 'block',
        width: '32px',
        height: '32px',
        paddingLeft: '8px',
        paddingRight: '8px',
    },
    commandBar: {
        // TODO: should probably tie this to panel width
        // TODO: handle small windows more gracefully
        marginLeft: '106px',
        flexGrow: 1,
    },
    link: {
        color: tokens.colorNeutralForeground2,
    },
    toggleLabel: {
        color: tokens.colorNeutralForeground2,
        fontWeight: 500,
    },
    theme: {
        display: 'inline-block',
        color: tokens.colorNeutralForeground2,
        minWidth: '32px',
    },
});

export const SiteHeader: React.FC<HTMLAttributes<HTMLElement>> = ({ className, ...props }) => {
    const classes = useClasses();
    const [, { setTrue: showHelp }] = useContext(HelpContext);
    const [darkMode, setDarkMode] = useContext(DarkModeContext);
    const [commands] = useContext(CommandBarContext);

    return (
        <header className={mergeClasses(classes.root, className)} {...props}>
            <div className={classes.brand}>
                <img src={logoUrl} alt="Site logo" className={classes.icon} />
                <Text size={500} weight="semibold">
                    XIVPlan
                </Text>
            </div>
            <div className={classes.commandBar}>{commands}</div>

            <Link onClick={showHelp} className={classes.link}>
                Help
            </Link>
            <AboutDialog className={classes.link} />
            <ExternalLink className={classes.link} href="https://github.com/joelspadin/xivplan" noIcon>
                GitHub
            </ExternalLink>
            <div>
                <Switch
                    label={{ children: 'Theme', className: classes.toggleLabel }}
                    labelPosition="before"
                    checked={darkMode}
                    onChange={(ev, data) => setDarkMode(data.checked)}
                />
                <Text className={classes.theme}>{darkMode ? 'Dark' : 'Light'}</Text>
            </div>
        </header>
    );
};
