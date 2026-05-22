import { Field } from '@fluentui/react-components';
import { CircleFilled, CircleRegular } from '@fluentui/react-icons';
import React from 'react';
import { Segment, SegmentedGroup } from '../../Segmented';
import type { HollowObject } from '../../scene';
import { setOrOmitAction, useObjectUpdater } from '../../useObjectUpdater';
import { commonValue, type Enum } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

const Styles = {
    Solid: 'solid',
    Hollow: 'hollow',
} as const;
type Styles = Enum<typeof Styles>;

export const HollowControl: React.FC<PropertiesControlProps<HollowObject>> = ({ objects }) => {
    const update = useObjectUpdater(objects);

    const hollow = commonValue(objects, (obj) => !!obj.hollow);
    const style = hollow ? Styles.Hollow : Styles.Solid;

    const onHollowChanged = (style: string) => update(setOrOmitAction<HollowObject>('hollow', style === Styles.Hollow));

    return (
        <Field label="Style">
            <SegmentedGroup name="shape-style" value={style} onChange={(ev, data) => onHollowChanged(data.value)}>
                <Segment value={Styles.Solid} icon={<CircleFilled />} title="Solid" />
                <Segment value={Styles.Hollow} icon={<CircleRegular />} title="Hollow" />
            </SegmentedGroup>
        </Field>
    );
};
