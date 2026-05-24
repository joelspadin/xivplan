import { Field } from '@fluentui/react-components';
import { CircleFilled, CircleHalfFillFilled, CircleRegular } from '@fluentui/react-icons';
import React from 'react';
import { Segment, SegmentedGroup } from '../../Segmented';
import { type StyledZone, type ZoneStyle, supportsGradient } from '../../scene';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const ZoneStyleControl: React.FC<PropertiesControlProps<StyledZone>> = ({ objects }) => {
    const update = useObjectUpdater(objects);
    const style = commonValue(objects, (obj) => obj.style);
    const showGradient = objects.every(supportsGradient);

    const onStyleChanged = (newStyle: ZoneStyle) => {
        update({ props: { style: newStyle } });
    };

    return (
        <Field label="Style">
            <SegmentedGroup
                name="zone-style"
                value={style ?? 'fill'}
                onChange={(_ev, data) => onStyleChanged(data.value as ZoneStyle)}
            >
                <Segment value="fill" icon={<CircleFilled />} title="Fill" />
                <Segment value="stroke" icon={<CircleRegular />} title="Stroke" />
                {showGradient && <Segment value="gradient" icon={<CircleHalfFillFilled />} title="Gradient" />}
            </SegmentedGroup>
        </Field>
    );
};
