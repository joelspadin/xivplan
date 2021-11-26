import {
    classNamesFunction,
    FontWeights,
    IButtonStyles,
    IconButton,
    IModalProps,
    IStyle,
    IStyleFunctionOrObject,
    mergeStyleSets,
    Modal,
    Theme,
    useTheme,
} from '@fluentui/react';
import { useId } from '@fluentui/react-hooks';
import React, { useMemo } from 'react';

export interface IBaseDialogStyles {
    container: IStyle;
    header: IStyle;
    body: IStyle;
}

export interface BaseDialogProps extends IModalProps {
    headerText: string;
    dialogStyles?: IStyleFunctionOrObject<Theme, IBaseDialogStyles>;
}

export const BaseDialog: React.FC<BaseDialogProps> = ({ headerText, dialogStyles, children, ...props }) => {
    const theme = useTheme();
    const classNames = mergeStyleSets(getClassNames(getStyles, theme), getClassNames(dialogStyles, theme));
    const buttonStyles = useMemo(() => getButtonStyles(theme), [theme]);
    const titleId = useId('title');

    return (
        <Modal titleAriaId={titleId} isBlocking={false} containerClassName={classNames.container} {...props}>
            <header className={classNames.header}>
                <span id={titleId}>{headerText}</span>
                <IconButton
                    ariaLabel="Close popup dialog"
                    styles={buttonStyles}
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={() => props.onDismiss?.()}
                />
            </header>
            <div className={classNames.body}>{children}</div>
        </Modal>
    );
};

const getClassNames = classNamesFunction<Theme, IBaseDialogStyles>();

const getStyles: IStyleFunctionOrObject<Theme, IBaseDialogStyles> = (theme) => {
    return {
        container: {
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'stretch',
        },
        header: [
            theme.fonts.xLarge,
            {
                flex: '1 1 auto',
                borderTop: `4px solid ${theme.palette.themePrimary}`,
                color: theme.palette.neutralPrimary,
                display: 'flex',
                alignItems: 'center',
                fontWeight: FontWeights.semibold,
                padding: '12px 12px 14px 24px',
            },
        ],
        body: {
            flex: '4 4 auto',
            padding: '0 24px 24px 24px',

            h2: theme.fonts.large,

            h3: [
                theme.fonts.medium,
                {
                    fontWeight: FontWeights.semibold,
                    marginBottom: 4,
                    '+ p': {
                        marginTop: 4,
                    } as IStyle,
                } as IStyle,
            ],
        },
    };
};

const getButtonStyles = (theme: Theme): IButtonStyles => {
    return {
        root: {
            color: theme.palette.neutralPrimary,
            marginLeft: 'auto',
            marginTop: 4,
            marginRight: 2,
        },
        rootHovered: {
            color: theme.palette.neutralDark,
        },
    };
};
