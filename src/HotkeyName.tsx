import { IStyle, IStyleFunctionOrObject } from '@fluentui/merge-styles';
import { useTheme } from '@fluentui/react';
import { Theme } from '@fluentui/theme';
import { classNamesFunction } from '@fluentui/utilities';
import React from 'react';

export interface HotkeysProps {
    keys: string;
    suffix?: string;
}

function formatKey(key: string) {
    return key.substr(0, 1).toUpperCase() + key.substr(1);
}

export const HotkeyName: React.FC<HotkeysProps> = ({ keys, suffix }) => {
    const theme = useTheme();
    const classNames = getClassNames(getStyles, theme);

    const parts = keys.split('+');

    return (
        <span className={classNames.root}>
            {parts.map((k, i) => {
                const isLast = i === parts.length - 1;
                const item = <kbd key={i}>{formatKey(k)}</kbd>;

                return isLast ? item : <React.Fragment key={i}>{item}+</React.Fragment>;
            })}
            {suffix && <span>+ {suffix}</span>}
        </span>
    );
};

interface IHotkeysStyles {
    root: IStyle;
}

const getClassNames = classNamesFunction<Theme, IHotkeysStyles>();

const getStyles: IStyleFunctionOrObject<Theme, IHotkeysStyles> = (theme) => {
    return {
        root: {
            display: 'flex',
            flexFlow: 'row',
            alignItems: 'center',
            whiteSpace: 'nowrap',

            kbd: [
                theme.fonts.small,
                {
                    display: 'inline-block',
                    padding: '3px 5px',
                    margin: '0 2px',
                    verticalAlign: 'middle',
                    lineHeight: 11,
                    background: theme.palette.neutralLight,
                    border: `1px solid ${theme.palette.neutralQuaternaryAlt}`,
                    borderRadius: 3,
                    boxShadow: `inset 0 -1px ${theme.palette.neutralLighter}`,
                    ':first-child': {
                        marginLeft: 0,
                    },
                    ':last-child': {
                        marginRight: 0,
                    },
                },
            ] as IStyle,
        },
    };
};
