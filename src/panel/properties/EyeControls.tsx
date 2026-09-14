import { Field } from '@fluentui/react-components';
import { bundleIcon, EyeFilled, EyeRegular, QuestionFilled, QuestionRegular } from '@fluentui/react-icons';
import React from 'react';
import type { EyeObject } from '../../scene';
import { Segment, SegmentedGroup } from '../../Segmented';
import { setOrOmitAction, useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

const EyeIcon = bundleIcon(EyeFilled, EyeRegular);
const QuestionIcon = bundleIcon(QuestionFilled, QuestionRegular);

const NORMAL = 'normal';
const INVERT = 'invert';

export const EyeInvertControl: React.FC<PropertiesControlProps<EyeObject>> = ({ objects }) => {
    const update = useObjectUpdater(objects);

    const value = commonValue(objects, (obj) => (obj.invert ? INVERT : NORMAL));

    const handleInvertChanged = (value: string) => update(setOrOmitAction<EyeObject>('invert', value === INVERT));

    return (
        <Field label="Gaze indicator">
            <SegmentedGroup name="eye-type" value={value} onChange={(ev, data) => handleInvertChanged(data.value)}>
                <Segment value={NORMAL} icon={<EyeIcon />} title="Look away" />
                <Segment value={INVERT} icon={<QuestionIcon />} title="Look towards" />
            </SegmentedGroup>
        </Field>
    );
};
