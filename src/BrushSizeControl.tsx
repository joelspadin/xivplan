import { Field, makeStyles, mergeClasses, SpinButtonProps, tokens } from '@fluentui/react-components';
import React from 'react';
import { sceneTokens } from './render/sceneTheme';
import { SpinButton } from './SpinButton';
import { useControlStyles } from './useControlStyles';

const BOX_SIZE = 30;

export interface BrushSizeControlProps extends SpinButtonProps {
    color: string;
    opacity: number;
}

export const BrushSizeControl: React.FC<BrushSizeControlProps> = ({ color, opacity, value, ...props }) => {
    const classes = useStyles();
    const controlClasses = useControlStyles();

    const size = value ?? 0;
    const pos = Math.max(BOX_SIZE / 2, size / 2);

    return (
        <div className={mergeClasses(controlClasses.row, controlClasses.rightGap)}>
            <Field label="Brush size" className={controlClasses.cell}>
                <SpinButton value={value} min={2} step={2} {...props} />
            </Field>

            <div className={classes.container}>
                <svg width={BOX_SIZE} height={BOX_SIZE}>
                    <circle cx={pos} cy={pos} r={size / 2} fill={color} opacity={opacity / 100} />
                </svg>
            </div>
        </div>
    );
};

const useStyles = makeStyles({
    container: {
        width: `${BOX_SIZE}px`,
        height: `${BOX_SIZE}px`,
        background: sceneTokens.colorArena,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        overflow: 'hidden',
    },
});
