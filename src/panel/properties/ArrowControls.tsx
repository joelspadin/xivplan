import { IconButton, Stack } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { Label } from 'react-konva';
import { useScene } from '../../SceneProvider';
import { ArrowObject } from '../../scene';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const ArrowPointersControl: React.FC<PropertiesControlProps<ArrowObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const arrowBegin = useMemo(() => commonValue(objects, (obj) => !!obj.arrowBegin), [objects]);
    const arrowEnd = useMemo(() => commonValue(objects, (obj) => !!obj.arrowEnd), [objects]);

    const onToggleArrowBegin = useCallback(
        () => dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'arrowBegin', !arrowBegin)) }),
        [dispatch, objects, arrowBegin],
    );

    const onToggleArrowEnd = useCallback(
        () => dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'arrowEnd', !arrowEnd)) }),
        [dispatch, objects, arrowEnd],
    );

    const arrowBeginIcon = arrowBegin ? 'TriangleSolidLeft12' : 'Remove';
    const arrowEndIcon = arrowEnd ? 'TriangleSolidRight12' : 'Remove';

    return (
        <Stack>
            <Label>Pointers</Label>
            <Stack horizontal>
                <IconButton iconProps={{ iconName: arrowBeginIcon }} onClick={onToggleArrowBegin} />
                <IconButton iconProps={{ iconName: arrowEndIcon }} onClick={onToggleArrowEnd} />
            </Stack>
        </Stack>
    );
};
