import { makeStyles, tokens, typographyStyles } from '@fluentui/react-components';
import React from 'react';

export interface HotkeysProps {
    keys: string;
    suffix?: string;
}

function formatKey(key: string) {
    return key.substring(0, 1).toUpperCase() + key.substring(1);
}

export const HotkeyName: React.FC<HotkeysProps> = ({ keys, suffix }) => {
    const classes = useStyles();
    const parts = keys === '+' ? ['+'] : keys.split('+');

    return (
        <span className={classes.root}>
            {parts.map((k, i) => {
                const isLast = i === parts.length - 1;
                const item = (
                    <kbd key={i} className={classes.key}>
                        {formatKey(k)}
                    </kbd>
                );

                return isLast ? item : <React.Fragment key={i}>{item}+</React.Fragment>;
            })}
            {suffix && <span>+ {suffix}</span>}
        </span>
    );
};

const useStyles = makeStyles({
    root: {
        display: 'inline-flex',
        flexFlow: 'row',
        alignItems: 'center',
        whiteSpace: 'nowrap',
    },
    key: {
        ...typographyStyles.caption1,
        display: 'inline-block',
        padding: '3px 5px',
        margin: '0 2px',
        verticalAlign: 'middle',
        lineHeight: '11px',
        background: tokens.colorNeutralBackground6,
        border: `1px solid ${tokens.colorNeutralStencil1}`,
        borderRadius: '4px',
        boxShadow: `inset 0 -1px ${tokens.colorNeutralBackground2}`,
        ':first-child': {
            marginLeft: 0,
        },
        ':last-child': {
            marginRight: 0,
        },
    },
});
