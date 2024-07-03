import { Button, Link, Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { WeatherMoonFilled, WeatherSunnyFilled } from '@fluentui/react-icons';
import React, { HTMLAttributes, useContext } from 'react';
import { OutPortal } from 'react-reverse-portal';
import { AboutDialog } from './AboutDialog';
import { ExternalLink } from './ExternalLink';
import { HelpContext } from './HelpProvider';
import { DarkModeContext } from './ThemeProvider';
import { ToolbarContext } from './ToolbarContext';
import logoUrl from './logo.svg';
import { PANEL_WIDTH } from './panel/PanelStyles';

const GAP = '20px';
const HEADER_HEIGHT = '48px';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'center',
        columnGap: GAP,
        minHeight: HEADER_HEIGHT,
        paddingInlineEnd: '30px',
    },
    brand: {
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        width: `calc(${PANEL_WIDTH}px - ${GAP})`,
    },
    icon: {
        display: 'block',
        width: '32px',
        height: '32px',
        paddingLeft: '8px',
        paddingRight: '8px',
    },
    commandBar: {
        flexGrow: 1,
    },
    link: {
        color: tokens.colorNeutralForeground2,
    },
    toggleLabel: {
        color: tokens.colorNeutralForeground2,
        fontWeight: 500,
    },
    themeButton: {
        minWidth: '130px',
    },
});

export const SiteHeader: React.FC<HTMLAttributes<HTMLElement>> = ({ className, ...props }) => {
    const classes = useStyles();
    const toolbarNode = useContext(ToolbarContext);
    const [, setHelpOpen] = useContext(HelpContext);
    const [darkMode, setDarkMode] = useContext(DarkModeContext);

    return (
        <header className={mergeClasses(classes.root, className)} {...props}>
            <div className={classes.brand}>
                <img src={logoUrl} alt="Site logo" className={classes.icon} />
                <Text size={500} weight="semibold">
                    XIVPlan
                </Text>
            </div>
            <div className={classes.commandBar}>
                <OutPortal node={toolbarNode} />
            </div>

            <Link onClick={() => setHelpOpen(true)} className={classes.link}>
                Help
            </Link>
            <AboutDialog className={classes.link} />
            <ExternalLink className={classes.link} href="https://github.com/joelspadin/xivplan" noIcon>
                GitHub
            </ExternalLink>
            <div>
                <Button
                    appearance="subtle"
                    className={classes.themeButton}
                    icon={darkMode ? <WeatherMoonFilled /> : <WeatherSunnyFilled />}
                    onClick={() => setDarkMode(!darkMode)}
                >
                    {darkMode ? 'Dark theme' : 'Light theme'}
                </Button>
            </div>
        </header>
    );
};
