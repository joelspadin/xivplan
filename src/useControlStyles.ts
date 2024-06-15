import { makeStyles, tokens } from '@fluentui/react-components';

export const useControlStyles = makeStyles({
    row: {
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'end',
        gap: tokens.spacingHorizontalS,
        marginBottom: tokens.spacingVerticalXS,
    },

    rightGap: {
        marginRight: '40px',
    },
});
