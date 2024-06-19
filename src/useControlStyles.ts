import { makeStyles, shorthands, tokens, typographyStyles } from '@fluentui/react-components';
import { PANEL_PADDING } from './panel/PanelStyles';

export const useControlStyles = makeStyles({
    panel: {
        padding: `${PANEL_PADDING}px`,
    },

    column: {
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalM,
    },

    row: {
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'end',
        gap: tokens.spacingHorizontalS,
        boxSizing: 'border-box',

        ':empty': {
            display: 'none',
        },
    },

    alignTop: {
        alignItems: 'start',
    },

    rightGap: {
        marginRight: '40px',
    },

    cell: {
        flex: `0 1 calc(50% - (${tokens.spacingHorizontalS}) / 2)`,
    },

    grow: {
        flexGrow: 1,
    },

    divider: {
        ...typographyStyles.body1,
        marginBottom: tokens.spacingVerticalS,
        flexGrow: 0,

        '::before': {
            ...shorthands.borderColor(tokens.colorNeutralStroke3),
        },
        '::after': {
            ...shorthands.borderColor(tokens.colorNeutralStroke3),
        },

        '[aria-orientation=horizontal]': {
            height: '28px',
        },

        '[aria-orientation=vertical]': {
            width: '8px',
        },
    },

    noSelect: {
        userSelect: 'none',
    },
});
