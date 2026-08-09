import {
    Radio,
    RadioGroup,
    type RadioGroupProps,
    type RadioProps,
    makeStyles,
    mergeClasses,
    radioClassNames,
    shorthands,
    tokens,
    typographyStyles,
} from '@fluentui/react-components';
import { iconFilledClassName, iconRegularClassName } from '@fluentui/react-icons';
import React, { type ReactNode } from 'react';
import { OptionalTooltip } from './OptionalTooltip';

export type SegmentedGroupProps = RadioGroupProps;

// RadioGroup reverts to uncontrolled when value=undefined, but we want it to
// show no value selected instead. Make an object that definitely doesn't match
// any item value to use instead and pretend it's a string.
const NONE_VALUE = Symbol() as unknown as string;

export const SegmentedGroup: React.FC<SegmentedGroupProps> = ({ children, value, ...props }) => {
    const classes = useStyles();

    return (
        <RadioGroup layout="horizontal-stacked" value={value ?? NONE_VALUE} {...props}>
            <div className={classes.track}>{children}</div>
        </RadioGroup>
    );
};

export interface SegmentProps extends RadioProps {
    icon?: ReactNode;
    size?: 'medium' | 'mediumText' | 'large';
}

export const Segment: React.FC<SegmentProps> = ({ className, icon, size, title, ...props }) => {
    const classes = useStyles();

    size = size ?? 'medium';

    return (
        <OptionalTooltip content={title} relationship="label" withArrow>
            <Radio
                className={mergeClasses(className, classes.item)}
                input={{ className: classes.input }}
                indicator={{ className: mergeClasses(classes.indicator, classes[size]), children: icon }}
                {...props}
            />
        </OptionalTooltip>
    );
};

const useStyles = makeStyles({
    track: {
        border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        background: tokens.colorNeutralBackground2,

        display: 'flex',
        flexFlow: 'row',
        gap: '1px',
    },

    item: {
        '::before': {
            zIndex: 0,

            content: '""',
            position: 'absolute',
            right: '-1px',
            top: '25%',
            bottom: '25%',
            width: '1px',
            background: tokens.colorNeutralStroke1,
            borderRadius: 0,
        },
    },

    input: {
        overflow: 'visible',

        ':enabled:not(:checked)': {
            [`& ~ .${radioClassNames.indicator}`]: {
                ...shorthands.borderColor('transparent'),
            },
        },

        ':hover': {
            [`& ~ .${radioClassNames.indicator}`]: {
                background: tokens.colorNeutralBackground1Hover,

                '::after': {
                    display: 'none',
                },
            },
        },

        ':hover:active': {
            [`& ~ .${radioClassNames.indicator}`]: {
                background: tokens.colorNeutralBackground1Pressed,
            },
        },

        ':enabled:checked': {
            [`& ~ .${radioClassNames.indicator}`]: {
                background: tokens.colorNeutralBackground1Selected,
                boxShadow: tokens.shadow2,

                [`& .${iconFilledClassName}`]: {
                    display: 'inline',
                },
                [`& .${iconRegularClassName}`]: {
                    display: 'none',
                },

                '::after': {
                    display: 'none',
                },
            },
        },

        [`:not(:checked) ~ .${radioClassNames.indicator} > *`]: {
            opacity: '1',
        },
    },

    indicator: {
        zIndex: 1,

        margin: '-1px',
        height: 'auto',
        width: 'auto',

        boxSizing: 'border-box',

        borderRadius: tokens.borderRadiusMedium,

        transitionProperty: 'background, border, color',
        transitionDuration: tokens.durationFaster,
        transitionTimingFunction: tokens.curveEasyEase,
    },

    medium: {
        minWidth: '34px',
        minHeight: '32px',
        fontSize: '20px',
    },

    mediumText: {
        minWidth: '34px',
        minHeight: '32px',
        ...typographyStyles.body2,
    },

    large: {
        minWidth: '42px',
        minHeight: '40px',
        fontSize: '24px',
    },
});
