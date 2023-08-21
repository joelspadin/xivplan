import {
    DialogFooter,
    IModalProps,
    IStyle,
    IStyleFunctionOrObject,
    Label,
    Pivot,
    PivotItem,
    PrimaryButton,
    TextField,
    Theme,
    mergeStyleSets,
} from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import React, { useEffect, useMemo, useRef } from 'react';
import { BaseDialog, IBaseDialogStyles } from '../BaseDialog';
import { useScene } from '../SceneProvider';
import { sceneToText } from '../file';

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
                <PivotItem headerText="Plan Code" className={classNames.tab}>
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

const labelStyles = mergeStyleSets({
    message: { transition: 'none', opacity: 1 } as IStyle,
    hidden: { transition: 'opacity 0.5s ease-in-out', opacity: 0 } as IStyle,
});

const ShareText: React.FC = () => {
    const { scene } = useScene();
    const data = useMemo(() => sceneToText(scene), [scene]);
    const [copyMessageVisible, setMessageVisibility] = useBoolean(false);
    const timerRef = useRef<number>();

    const doCopyToClipboard = () => {
        navigator.clipboard.writeText(data);
        setMessageVisibility.setTrue();
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setMessageVisibility.setFalse(), 2000);
    };
    const labelClasses = `${labelStyles.message} ${copyMessageVisible ? '' : labelStyles.hidden}`;

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, [scene]);

    return (
        <>
            <TextField multiline readOnly rows={7} value={data} />
            <DialogFooter className={classNames.footer}>
                <Label className={labelClasses}>Successfully Copied</Label>
                <PrimaryButton iconProps={copyIconProps} text="Copy to Clipboard" onClick={doCopyToClipboard} />
            </DialogFooter>
        </>
    );
};
