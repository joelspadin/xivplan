import { IChoiceGroupOption, IStackTokens, mergeStyleSets, Position, SpinButton, Stack } from '@fluentui/react';
import React from 'react';
import { CompactChoiceGroup } from '../CompactChoiceGroup';
import { useSpinChanged } from '../prefabs/CommonProperties';
import { ArenaShape } from '../scene';
import { useScene } from '../SceneProvider';

const classNames = mergeStyleSets({
    fullCell: {
        width: '100%',
    },
});

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const arenaShapes: IChoiceGroupOption[] = [
    // TODO: use CircleShape and SquareShape whenever icon font gets fixed.
    { key: ArenaShape.Circle, text: 'Ellipse', iconProps: { iconName: 'CircleRing' } },
    { key: ArenaShape.Rectangle, text: 'Rectangle', iconProps: { iconName: 'Checkbox' } },
];

export const ArenaShapeEdit: React.FunctionComponent = () => {
    const [scene, dispatch] = useScene();
    const { shape, width, height, padding } = scene.arena;

    const onWidthChanged = useSpinChanged((value) => dispatch({ type: 'arenaWidth', value }), [dispatch]);
    const onHeightChanged = useSpinChanged((value) => dispatch({ type: 'arenaHeight', value }), [dispatch]);
    const onPaddingChanged = useSpinChanged((value) => dispatch({ type: 'arenaPadding', value }), [dispatch]);

    return (
        <Stack tokens={stackTokens}>
            <Stack horizontal tokens={stackTokens}>
                <Stack.Item className={classNames.fullCell}>
                    <CompactChoiceGroup
                        label="Arena shape"
                        options={arenaShapes}
                        selectedKey={shape}
                        onChange={(ev, option) => {
                            option && dispatch({ type: 'arenaShape', value: option.key as ArenaShape });
                        }}
                    />
                </Stack.Item>
                <SpinButton
                    label="Padding"
                    labelPosition={Position.top}
                    min={20}
                    step={10}
                    value={padding.toString()}
                    onChange={onPaddingChanged}
                />
            </Stack>
            <Stack horizontal tokens={stackTokens}>
                <SpinButton
                    label="Width"
                    labelPosition={Position.top}
                    min={50}
                    step={50}
                    value={width.toString()}
                    onChange={onWidthChanged}
                />
                <SpinButton
                    label="Height"
                    labelPosition={Position.top}
                    min={50}
                    step={50}
                    value={height.toString()}
                    onChange={onHeightChanged}
                />
            </Stack>
        </Stack>
    );
};
