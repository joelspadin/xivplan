import { Field } from '@fluentui/react-components';
import { CircleFilled, CircleRegular } from '@fluentui/react-icons';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { HollowObject } from '../../scene';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

enum Styles {
    Solid = 'solid',
    Hollow = 'hollow',
}

export const HollowControl: React.FC<PropertiesControlProps<HollowObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const hollow = useMemo(() => commonValue(objects, (obj) => !!obj.hollow), [objects]);
    const style = hollow ? Styles.Hollow : Styles.Solid;

    const onHollowChanged = useCallback(
        (style: string) => {
            const hollow = style === Styles.Hollow;
            dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'hollow', hollow)) });
        },
        [dispatch, objects],
    );
    const { t } = useTranslation();

    return (
        <Field label={t('HollowControl.Style')}>
            <SegmentedGroup name="shape-style" value={style} onChange={(ev, data) => onHollowChanged(data.value)}>
                <Segment value={Styles.Solid} icon={<CircleFilled />} title={t('HollowControl.Solid')} />
                <Segment value={Styles.Hollow} icon={<CircleRegular />} title={t('HollowControl.Hollow')} />
            </SegmentedGroup>
        </Field>
    );
};
