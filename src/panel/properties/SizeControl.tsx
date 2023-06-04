import { IStackTokens, IStyle, Position, SpinButton, Stack, mergeStyleSets } from '@fluentui/react';
import React, { useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { ResizeableObject } from '../../scene';
import { commonValue } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const classNames = mergeStyleSets({
    sizeRow: {
        marginRight: 32 + 10,
    } as IStyle,
});

export const SizeControl: React.FC<PropertiesControlProps<ResizeableObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const width = useMemo(() => commonValue(objects, (obj) => obj.width), [objects]);
    const height = useMemo(() => commonValue(objects, (obj) => obj.height), [objects]);

    const onWidthChanged = useSpinChanged(
        (width: number) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, width })) }),
        [dispatch, objects],
    );
    const onHeightChanged = useSpinChanged(
        (height: number) => dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, height })) }),
        [dispatch, objects],
    );

    return (
        <>
            <Stack horizontal tokens={stackTokens} className={classNames.sizeRow}>
                <SpinButton
                    label="Width"
                    labelPosition={Position.top}
                    value={width?.toString() ?? ''}
                    onChange={onWidthChanged}
                    min={20}
                    step={10}
                />
                <SpinButton
                    label="Height"
                    labelPosition={Position.top}
                    value={height?.toString() ?? ''}
                    onChange={onHeightChanged}
                    min={20}
                    step={10}
                />
            </Stack>
        </>
    );
};
