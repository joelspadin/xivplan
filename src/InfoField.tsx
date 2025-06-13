import {
    Field,
    FieldProps,
    ForwardRefComponent,
    InfoLabel,
    InfoLabelProps,
    LabelProps,
} from '@fluentui/react-components';
import React from 'react';

export interface InfoFieldProps extends FieldProps {
    info?: InfoLabelProps['info'];
}

/**
 * Shortcut for a <Field> with an <InfoLabel> as its label.
 */
export const InfoField: ForwardRefComponent<InfoFieldProps> = React.forwardRef((props, ref) => {
    const { label, info, children, ...rest } = props;
    return (
        <Field
            ref={ref}
            {...rest}
            label={{
                children: (_: unknown, slotProps: LabelProps) => (
                    <InfoLabel {...slotProps} info={info}>
                        {label}
                    </InfoLabel>
                ),
            }}
        >
            {children}
        </Field>
    );
});

InfoField.displayName = 'InfoField';
