import { Field, FieldProps, InfoLabel, InfoLabelProps, LabelProps } from '@fluentui/react-components';
import React, { RefAttributes } from 'react';

export interface InfoFieldProps extends FieldProps, RefAttributes<HTMLDivElement> {
    info?: InfoLabelProps['info'];
}

/**
 * Shortcut for a <Field> with an <InfoLabel> as its label.
 */
export const InfoField: React.FC<InfoFieldProps> = ({ ref, label, info, children, ...rest }) => {
    return (
        <Field
            ref={ref}
            label={{
                children: (_: unknown, slotProps: LabelProps) => (
                    <InfoLabel {...slotProps} info={info}>
                        {label}
                    </InfoLabel>
                ),
            }}
            {...rest}
        >
            {children}
        </Field>
    );
};
