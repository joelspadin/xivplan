import { Field } from '@fluentui/react-components';
import { CircleFilled, CircleRegular, SquareFilled, SquareRegular, bundleIcon } from '@fluentui/react-icons';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useScene } from '../../SceneProvider';
import { Segment, SegmentedGroup } from '../../Segmented';
import { MarkerObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const SquareIcon = bundleIcon(SquareFilled, SquareRegular);

export const MarkerShapeControl: React.FC<PropertiesControlProps<MarkerObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const shape = useMemo(() => commonValue(objects, (obj) => obj.shape), [objects]);

    const onShapeChanged = useCallback(
        (shape: string) => {
            dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, shape })) });
        },
        [dispatch, objects],
    );
    const { t } = useTranslation();

    return (
        <Field label={t('MarkerControls.Shape')}>
            <SegmentedGroup name="shape" value={shape} onChange={(ev, data) => onShapeChanged(data.value)}>
                <Segment value="circle" icon={<CircleIcon />} title={t('MarkerControls.Circle')} />
                <Segment value="square" icon={<SquareIcon />} title={t('MarkerControls.Square')} />
            </SegmentedGroup>
        </Field>
    );
};
