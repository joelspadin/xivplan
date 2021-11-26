import { classNamesFunction, Icon, IIconProps, IStyle, IStyleFunction, Text, Theme, useTheme } from '@fluentui/react';
import React from 'react';

export interface INoticeProps {
    title?: string;
    iconProps?: IIconProps;
    className?: string;
}

interface INoticeStyles {
    root: IStyle;
    title: IStyle;
    icon: IStyle;
    message: IStyle;
}

export const Alert: React.FunctionComponent<INoticeProps> = ({ children, className, iconProps, title }) => {
    const theme = useTheme();
    const classNames = getClassNames(getStyles, theme);

    return (
        <div className={`${classNames.root} ${className || ''}`}>
            <Text block as="h2" variant="mediumPlus" className={classNames.title}>
                {iconProps && <Icon {...iconProps} className={classNames.icon} />} {title}
            </Text>
            <Text block className={classNames.message}>
                {children}
            </Text>
        </div>
    );
};

const getClassNames = classNamesFunction<Theme, INoticeStyles>();

const getStyles: IStyleFunction<Theme, INoticeStyles> = (theme) => {
    return {
        root: {
            backgroundColor: theme.palette.themeLight,
            borderRadius: theme.effects.roundedCorner6,
            boxShadow: theme.effects.elevation4,
            padding: '1rem',
            marginTop: '1rem',

            'p:last-child, ul:last-child': {
                marginBottom: 0,
            } as IStyle,
        },
        title: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 0,
        },
        icon: {
            width: 16,
            height: 16,
            fontSize: 16,
            marginInlineEnd: 8,
        },
        message: {
            marginTop: '1rem',
        },
    };
};
