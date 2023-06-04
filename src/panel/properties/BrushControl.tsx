import React, { useMemo } from 'react';
import { BrushSizeControl } from '../../BrushSizeControl';
import { useScene } from '../../SceneProvider';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { DrawObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

export const DrawObjectBrushControl: React.FC<PropertiesControlProps<DrawObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const brushSize = useMemo(() => commonValue(objects, (obj) => obj.brushSize), [objects]);

    const onSizeChanged = useSpinChanged(
        (brushSize: number) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, brushSize })) }),
        [dispatch, objects],
    );
    return (
        <BrushSizeControl
            value={brushSize?.toString() ?? ''}
            color={objects[0]?.color ?? ''}
            opacity={objects[0]?.opacity ?? 1}
            onChange={onSizeChanged}
        />
    );
};
