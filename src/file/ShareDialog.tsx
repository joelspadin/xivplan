import {
    DialogFooter,
    IModalProps,
    IStyle,
    IStyleFunctionOrObject,
    Pivot,
    PivotItem,
    PrimaryButton,
    TextField,
    Theme,
    mergeStyleSets,
} from '@fluentui/react';
import React from 'react';
import { BaseDialog, IBaseDialogStyles } from '../BaseDialog';
import { useScene } from '../SceneProvider';

const classNames = mergeStyleSets({
    tab: {
        minHeight: 200,
        display: 'grid',
        gridTemplateRows: '1fr auto',
        gridTemplateAreas: `
            "content"
            "footer"
        `,
    } as IStyle,
    footer: {
        gridArea: 'footer',
    } as IStyle,
});

const copyIconProps = { iconName: 'Copy' };

export const ShareDialog: React.FC<IModalProps> = (props) => {
    return (
        <BaseDialog headerText="Share" {...props} dialogStyles={dialogStyles}>
            <Pivot>
                <PivotItem headerText="Export String" className={classNames.tab}>
                    <ShareText />
                </PivotItem>
            </Pivot>
        </BaseDialog>
    );
};

const dialogStyles: IStyleFunctionOrObject<Theme, IBaseDialogStyles> = {
    body: {
        minWidth: 500,
        maxWidth: '70ch',
    },
};

const ShareText: React.FC = () => {
    const { scene } = useScene();
    const data = btoa(JSON.stringify(scene));

    const doCopyToClipboard = () => {
        navigator.clipboard.writeText(data);
    };

    return (
        <>
            <TextField multiline readOnly rows={7} value={data} />
            <DialogFooter className={classNames.footer}>
                <PrimaryButton iconProps={copyIconProps} text="Copy to Clipboard" onClick={doCopyToClipboard} />
            </DialogFooter>
        </>
    );
};
