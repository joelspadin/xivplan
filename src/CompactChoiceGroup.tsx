import {
    ChoiceGroup,
    DefaultEffects,
    IChoiceGroupOption,
    IChoiceGroupOptionProps,
    IChoiceGroupOptionStyleProps,
    IChoiceGroupOptionStyles,
    IChoiceGroupProps,
    IChoiceGroupStyles,
    IRenderFunction,
    IStyle,
    IStyleFunction,
} from '@fluentui/react';
import React, { useMemo } from 'react';

const containerStyles: Partial<IChoiceGroupStyles> = {
    root: {
        margin: 0,
    },
    flexContainer: {
        flexFlow: 'row',
    },
    label: {
        whiteSpace: 'nowrap',
    },
};

const getStyles: (padding?: number) => IStyleFunction<IChoiceGroupOptionStyleProps, IChoiceGroupOptionStyles> =
    (padding = 0) =>
    ({ theme, checked }) => ({
        root: {
            margin: 0,
            boxSizing: 'border-box',
            ':first-child, :first-child label': {
                borderTopLeftRadius: DefaultEffects.roundedCorner4,
                borderBottomLeftRadius: DefaultEffects.roundedCorner4,
            } as IStyle,
            ':last-child, :last-child label': {
                borderTopRightRadius: DefaultEffects.roundedCorner4,
                borderBottomRightRadius: DefaultEffects.roundedCorner4,
            } as IStyle,
        },
        field: {
            '::before, ::after': {
                display: 'none',
            },
            width: 32 + padding * 2,
            height: 32 + padding * 2,
            padding: padding,
            boxSizing: 'border-box',
        },
        innerField: {
            padding: 0,
        },
        labelWrapper: {
            display: 'none',
        },
        iconWrapper: {
            fontSize: 16,
            height: 16,
            lineHeight: 16,
            color: checked ? theme.semanticColors.inputBackgroundChecked : 'inherit',
        },
    });

const onRenderField: IRenderFunction<IChoiceGroupOption & IChoiceGroupOptionProps> = (props, defaultRender) => {
    if (!props || !defaultRender) {
        return null;
    }

    return <div title={props.text}>{defaultRender(props)}</div>;
};

export interface CompactChoiceGroupProps extends IChoiceGroupProps {
    padding?: number;
}

export const CompactChoiceGroup: React.FC<CompactChoiceGroupProps> = ({ options, padding, ...props }) => {
    const styles = useMemo(() => getStyles(padding), [padding]);
    const styledOptions = options?.map((opt) => ({ ...opt, styles, onRenderField }));

    return <ChoiceGroup options={styledOptions} styles={containerStyles} {...props} />;
};
