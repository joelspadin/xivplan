import { IStackTokens, IconButton, Position, SpinButton, Stack } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { useScene } from '../../SceneProvider';
import { useSpinChanged } from '../../prefabs/useSpinChanged';
import { MoveableObject } from '../../scene';
import { commonValue, setOrOmit } from '../../util';
import { PropertiesControlProps } from '../PropertiesControl';

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

export const PositionControl: React.FC<PropertiesControlProps<MoveableObject>> = ({ objects }) => {
    const { dispatch } = useScene();

    const x = useMemo(() => commonValue(objects, (obj) => obj.x), [objects]);
    const y = useMemo(() => commonValue(objects, (obj) => obj.y), [objects]);
    const pinned = useMemo(() => commonValue(objects, (obj) => !!obj.pinned), [objects]);

    const onTogglePinned = useCallback(
        () => dispatch({ type: 'update', value: objects.map((obj) => setOrOmit(obj, 'pinned', !pinned)) }),
        [dispatch, objects, pinned],
    );

    const onXChanged = useSpinChanged((x: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, x })) }),
    );
    const onYChanged = useSpinChanged((y: number) =>
        dispatch({ type: 'update', value: objects.map((obj) => ({ ...obj, y })) }),
    );

    const iconName = pinned === undefined ? 'Unlock' : pinned ? 'LockSolid' : 'UnlockSolid';

    return (
        <>
            <Stack horizontal tokens={stackTokens} verticalAlign="end">
                <SpinButton
                    label="X"
                    labelPosition={Position.top}
                    value={x?.toString() ?? ''}
                    onChange={onXChanged}
                    step={10}
                />
                <SpinButton
                    label="Y"
                    labelPosition={Position.top}
                    value={y?.toString() ?? ''}
                    onChange={onYChanged}
                    step={10}
                />
                <IconButton
                    iconProps={{ iconName }}
                    toggle
                    checked={pinned}
                    onClick={onTogglePinned}
                    title="Lock object"
                />
            </Stack>
        </>
    );
};
