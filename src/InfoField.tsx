import {
    FieldProps,
    FieldState,
    ForwardRefComponent,
    InfoLabel,
    InfoLabelProps,
    PopoverSurfaceProps,
    Slot,
    renderField_unstable,
    slot,
    useFieldContextValues_unstable,
    useFieldStyles_unstable,
    useField_unstable,
} from '@fluentui/react-components';
import React from 'react';

// TODO: remove this once https://github.com/microsoft/fluentui/issues/31482 is implemented
// and it is possible to set an InfoLabel in a Field's label slot.

export interface InfoFieldProps extends FieldProps {
    info?: NonNullable<Slot<ForwardRefComponent<PopoverSurfaceProps>>>;
}

export const InfoField: ForwardRefComponent<InfoFieldProps> = React.forwardRef((props, ref) => {
    const state = useInfoField(props, ref);
    useFieldStyles_unstable(state);
    const context = useFieldContextValues_unstable(state);
    return renderField_unstable(state, context);
});

InfoField.displayName = 'InfoField';

const useInfoField = (props: InfoFieldProps, ref: React.Ref<HTMLDivElement>): FieldState => {
    const { info, ...rest } = props;

    const state = useField_unstable(rest, ref);

    const id = state.label?.id ?? '';
    const htmlFor = state.label?.htmlFor ?? '';

    const label = slot.optional<InfoLabelProps>(props.label, {
        defaultProps: { htmlFor, id, info, required: rest.required, size: 'medium' },
        elementType: InfoLabel,
    });

    return {
        ...state,
        components: { ...state.components, label: InfoLabel },
        label,
    };
};
