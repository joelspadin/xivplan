import {
    ToggleButton,
    ToggleButtonProps,
    Tooltip,
    makeStyles,
    mergeClasses,
    shorthands,
    tokens,
} from '@fluentui/react-components';
import React from 'react';

export type PrefabToggleProps = ToggleButtonProps & {
    label: string;
};

export const PrefabToggle: React.FC<PrefabToggleProps> = ({ label, className, ...props }) => {
    const classes = useStyles();

    return (
        <Tooltip content={label} relationship="label" withArrow>
            <ToggleButton
                appearance="subtle"
                {...props}
                className={mergeClasses(className, props.checked && classes.checked)}
            />
        </Tooltip>
    );
};

const useStyles = makeStyles({
    checked: {
        ...shorthands.borderColor(tokens.colorBrandStroke1),

        ':hover': {
            ...shorthands.borderColor(tokens.colorBrandStroke1),
        },
    },
});
