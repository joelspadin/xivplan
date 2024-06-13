import { IDetailsListStyles, IStyle, mergeStyleSets } from '@fluentui/react';

export const classNames = mergeStyleSets({
    tab: {
        minHeight: 200,
        display: 'grid',
        gridTemplateRows: '1fr auto',
        gridTemplateAreas: `
            "content"
            "footer"
        `,
    } as IStyle,
    form: {
        gridArea: 'content',
        marginTop: 8,
    } as IStyle,
    footer: {
        gridArea: 'footer',
    } as IStyle,

    listButton: {
        margin: '-7px 0 -7px',
    } as IStyle,
});

export const listStyles: Partial<IDetailsListStyles> = {
    root: {
        overflowX: 'auto',
        width: '100%',
        '& [role=grid]': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            maxHeight: '50vh',
        } as IStyle,
    },
    headerWrapper: {
        flex: '0 0 auto',
    },
    contentWrapper: {
        flex: '1 1 auto',
        overflowX: 'hidden',
        overflowY: 'auto',
    },
};

export interface FileDialogTabProps {
    onDismiss?: () => void;
}
