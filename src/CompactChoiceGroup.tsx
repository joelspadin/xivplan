import {
    ChoiceGroup,
    DefaultEffects,
    IChoiceGroupOptionProps,
    IChoiceGroupOptionStyleProps,
    IChoiceGroupOptionStyles,
    IChoiceGroupProps,
    IChoiceGroupStyles,
    IRenderFunction,
    IStyle,
    IStyleFunction,
} from '@fluentui/react';
import React from 'react';

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

const styles: IStyleFunction<IChoiceGroupOptionStyleProps, IChoiceGroupOptionStyles> = ({ theme, checked }) => ({
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
        width: 32,
        height: 32,
        padding: 0,
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

const onRenderField: IRenderFunction<IChoiceGroupOptionProps> = (props, defaultRender) => {
    if (!props || !defaultRender) {
        return null;
    }

    return <div title={props.text}>{defaultRender(props)}</div>;
};

export const CompactChoiceGroup: React.FC<IChoiceGroupProps> = ({ options, ...props }) => {
    const styledOptions = options?.map((opt) => ({ ...opt, styles, onRenderField }));

    return <ChoiceGroup options={styledOptions} styles={containerStyles} {...props} />;
};
