import { Button, Link, Text, Tooltip, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { WeatherMoonFilled, WeatherSunnyFilled } from '@fluentui/react-icons';
import React, { HTMLAttributes, useContext } from 'react';
import { OutPortal } from 'react-reverse-portal';
import { AboutDialog } from './AboutDialog';
import { ExternalLink } from './ExternalLink';
import { HelpContext } from './HelpProvider';
import { PANEL_WIDTH } from './panel/PanelStyles';
import { FileSource, useScene } from './SceneProvider';
import { DarkModeContext } from './ThemeProvider';
import { ToolbarContext } from './ToolbarContext';
import { useIsDirty } from './useIsDirty';
import { removeFileExtension } from './util';

const GAP = tokens.spacingHorizontalL;
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
    title: {
        display: 'flex',
        alignItems: 'baseline',
        boxSizing: 'border-box',
        paddingLeft: tokens.spacingHorizontalM,
        gap: GAP,
        width: `calc(${PANEL_WIDTH}px - ${GAP})`,
        textDecoration: 'none',
    },
    source: {
        display: 'inline-flex',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    filename: {
        color: tokens.colorNeutralForeground3,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    dirty: {
        paddingInlineStart: tokens.spacingHorizontalXS,
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
    const { source } = useScene();
    const toolbarNode = useContext(ToolbarContext);
    const [, setHelpOpen] = useContext(HelpContext);
    const [darkMode, setDarkMode] = useContext(DarkModeContext);

    const titleSize = source ? 400 : 500;

    return (
        <header className={mergeClasses(classes.root, className)} {...props}>
            <div className={classes.title}>
                <Text size={titleSize} weight="semibold">
                    XIVPlan
                </Text>
                {source && <SourceIndicator source={source} />}
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

interface SourceIndicatorProps {
    source: FileSource;
}

const SourceIndicator: React.FC<SourceIndicatorProps> = ({ source }) => {
    const classes = useStyles();
    const isDirty = useIsDirty();

    const tooltip = isDirty ? `${source.name} (unsaved changes)` : source.name;

    return (
        <Tooltip content={tooltip} relationship="description">
            <span className={classes.source}>
                <Text className={classes.filename}>{removeFileExtension(source.name)}</Text>
                {isDirty && <Text className={classes.dirty}>●</Text>}
            </span>
        </Tooltip>
    );
};
