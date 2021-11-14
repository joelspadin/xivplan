import {
    classNamesFunction,
    ISpinButtonProps,
    IStackTokens,
    IStyle,
    Position,
    SpinButton,
    Stack,
    Theme,
    useTheme,
} from '@fluentui/react';
import React from 'react';
import { ARENA_BACKGROUND_COLOR } from './render/SceneTheme';

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

interface IContentStyles {
    container: IStyle;
    brush: IStyle;
}

const getClassNames = classNamesFunction<Theme, IContentStyles>();

const BOX_SIZE = 30;

export interface BrushSizeControlProps extends ISpinButtonProps {
    color: string;
    opacity: number;
}

export const BrushSizeControl: React.FC<BrushSizeControlProps> = ({ color, opacity, ...props }) => {
    const theme = useTheme();
    const classNames = getClassNames(() => {
        return {
            container: {
                width: BOX_SIZE,
                height: BOX_SIZE,
                background: ARENA_BACKGROUND_COLOR,
                border: `1px solid ${theme.semanticColors.inputBorder}`,
                overflow: 'hidden',
            },
        };
    });

    const size = parseInt(props.value ?? '0');
    const pos = Math.max(BOX_SIZE / 2, size / 2);

    return (
        <Stack horizontal tokens={stackTokens} verticalAlign="end">
            <SpinButton label="Brush size" labelPosition={Position.top} min={2} step={2} {...props} />
            <Stack.Item>
                <div className={classNames.container}>
                    <svg width={BOX_SIZE} height={BOX_SIZE}>
                        <circle cx={pos} cy={pos} r={size / 2} fill={color} opacity={opacity / 100} />
                    </svg>
                </div>
            </Stack.Item>
        </Stack>
    );
};
