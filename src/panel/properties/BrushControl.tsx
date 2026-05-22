import React from 'react';
import { BrushSizeControl } from '../../BrushSizeControl';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import type { DrawObject } from '../../scene';
import { useObjectUpdater } from '../../useObjectUpdater';
import { commonValue } from '../../util';
import type { PropertiesControlProps } from '../PropertiesControl';

export const DrawObjectBrushControl: React.FC<PropertiesControlProps<DrawObject>> = ({ objects }) => {
    const update = useObjectUpdater(objects);

    const brushSize = commonValue(objects, (obj) => obj.brushSize);

    const onSizeChanged = useSpinChanged((brushSize: number) => update({ props: { brushSize } }));

    return (
        <BrushSizeControl
            value={brushSize}
            color={objects[0]?.color ?? ''}
            opacity={objects[0]?.opacity ?? 1}
            onChange={onSizeChanged}
        />
    );
};
