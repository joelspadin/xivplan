import {
    Radio,
    RadioGroup,
    RadioGroupProps,
    RadioProps,
    Tooltip,
    TooltipProps,
    makeStyles,
    mergeClasses,
    radioClassNames,
    shorthands,
    tokens,
} from '@fluentui/react-components';
import { iconFilledClassName, iconRegularClassName } from '@fluentui/react-icons';
import React, { ReactNode } from 'react';

export interface SegmentedGroupProps extends RadioGroupProps {}

export const SegmentedGroup: React.FC<SegmentedGroupProps> = ({ children, ...props }) => {
    const classes = useStyles();

    return (
        <RadioGroup layout="horizontal-stacked" {...props}>
            <div className={classes.track}>{children}</div>
        </RadioGroup>
    );
};

export interface SegmentProps extends RadioProps {
    icon?: ReactNode;
    size?: 'medium' | 'large';
}

export const Segment: React.FC<SegmentProps> = ({ className, icon, size, title, ...props }) => {
    const classes = useStyles();

    size = size ?? 'medium';

    return (
        <TooltipWrapper content={title} relationship="label" positioning="below" appearance="inverted" withArrow>
            <Radio
                className={mergeClasses(className, classes.item)}
                input={{ className: classes.input }}
                indicator={{ className: mergeClasses(classes.indicator, classes[size]), children: icon }}
                {...props}
            />
        </TooltipWrapper>
    );
};

interface TooltipWrapperProps extends Omit<TooltipProps, 'content'> {
    content?: string;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({ children, content, ...props }) => {
    return content ? (
        <Tooltip content={content} {...props}>
            {children}
        </Tooltip>
    ) : (
        <>{children}</>
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
        '::after': {
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

    large: {
        minWidth: '42px',
        minHeight: '40px',
        fontSize: '24px',
    },
});
