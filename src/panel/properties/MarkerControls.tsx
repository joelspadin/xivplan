import { Field } from '@fluentui/react-components';
import { CircleFilled, CircleRegular, SquareFilled, SquareRegular, bundleIcon } from '@fluentui/react-icons';
import React from 'react';
import { Segment, SegmentedGroup } from '../../Segmented';
import type { MarkerObject } from '../../scene';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const SquareIcon = bundleIcon(SquareFilled, SquareRegular);

export const MarkerShapeControl: React.FC<PropertiesControlProps<MarkerObject>> = ({ objects }) => {
    const update = useObjectUpdater(objects);

    const shape = commonValue(objects, (obj) => obj.shape);

    const onShapeChanged = (shape: string) => update({ props: { shape: shape as MarkerObject['shape'] } });

    return (
        <Field label="Shape">
            <SegmentedGroup name="shape" value={shape} onChange={(ev, data) => onShapeChanged(data.value)}>
                <Segment value="circle" icon={<CircleIcon />} title="Circle" />
                <Segment value="square" icon={<SquareIcon />} title="Square" />
            </SegmentedGroup>
        </Field>
    );
};
