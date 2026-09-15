import { Field } from '@fluentui/react-components';
import { bundleIcon, EyeFilled, EyeRegular, QuestionFilled, QuestionRegular } from '@fluentui/react-icons';
import React from 'react';
import type { EyeObject } from '../../scene';
import { BooleanSegment, BooleanSegmentedGroup } from '../../Segmented';
import { setOrOmitAction, useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

const EyeIcon = bundleIcon(EyeFilled, EyeRegular);
const QuestionIcon = bundleIcon(QuestionFilled, QuestionRegular);

export const EyeInvertControl: React.FC<PropertiesControlProps<EyeObject>> = ({ objects }) => {
    const update = useObjectUpdater(objects);

    const invert = commonValue(objects, (obj) => !!obj.invert);

    const handleInvertChanged = (value: boolean) => update(setOrOmitAction<EyeObject>('invert', value));

    return (
        <Field label="Gaze indicator">
            <BooleanSegmentedGroup
                name="eye-type"
                value={invert}
                onChange={(ev, data) => handleInvertChanged(data.value)}
            >
                <BooleanSegment value={false} icon={<EyeIcon />} title="Look away" />
                <BooleanSegment value={true} icon={<QuestionIcon />} title="Look towards" />
            </BooleanSegmentedGroup>
        </Field>
    );
};
