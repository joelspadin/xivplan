import { makeStyles, tokens } from '@fluentui/react-components';

export const useControlStyles = makeStyles({
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
    },

    rightGap: {
        marginRight: '40px',
    },

    cell: {
        flex: 1,
    },
});
