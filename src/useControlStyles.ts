import { makeStyles, tokens } from '@fluentui/react-components';

export const useControlStyles = makeStyles({
    row: {
        display: 'flex',
        flexFlow: 'row',
        gap: tokens.spacingHorizontalM,
        alignItems: 'end',
    },
});
