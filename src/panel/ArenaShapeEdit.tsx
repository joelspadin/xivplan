import { Dropdown, IDropdownOption, IStackTokens, Position, SpinButton, Stack } from '@fluentui/react';
import React from 'react';
import { ArenaShape } from '../scene';
import { useScene } from '../SceneProvider';

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const arenaShapes: IDropdownOption[] = [
    { key: ArenaShape.Circle, text: 'Ellipse' },
    { key: ArenaShape.Rectangle, text: 'Rectangle' },
];

export const ArenaShapeEdit: React.FunctionComponent = () => {
    const [scene, dispatch] = useScene();
    const { shape, width, height } = scene.arena;

    return (
        <Stack tokens={stackTokens}>
            <Dropdown
                label="Arena shape"
                options={arenaShapes}
                selectedKey={shape}
                onChange={(ev, option) => {
                    option && dispatch({ type: 'arenaShape', value: option.key as ArenaShape });
                }}
            />
            <Stack horizontal tokens={stackTokens}>
                <SpinButton
                    label="Arena width"
                    labelPosition={Position.top}
                    min={50}
                    step={50}
                    value={width.toString()}
                    onChange={(ev, newValue) => {
                        newValue && dispatch({ type: 'arenaWidth', value: parseInt(newValue) });
                    }}
                />
                <SpinButton
                    label="Arena height"
                    labelPosition={Position.top}
                    min={50}
                    step={50}
                    value={height.toString()}
                    onChange={(ev, newValue) => {
                        newValue && dispatch({ type: 'arenaHeight', value: parseInt(newValue) });
                    }}
                />
            </Stack>
        </Stack>
    );
};
