import { DefaultButton, IStackTokens, IStyle, mergeStyleSets, Stack, TextField } from '@fluentui/react';
import React from 'react';
import { ArenaPreset } from '../scene';
import { useScene } from '../SceneProvider';
import { ArenaGridEdit } from './ArenaGridEdit';
import { ARENA_PRESETS } from './ArenaPresets';
import { ArenaShapeEdit } from './ArenaShapeEdit';
import { PANEL_PADDING } from './PanelStyles';
import { Section } from './Section';

const stackTokens: IStackTokens = {
    childrenGap: 10,
};

const classNames = mergeStyleSets({
    panel: {
        padding: PANEL_PADDING,
    } as IStyle,
});

export const ArenaPanel: React.FunctionComponent = () => {
    const [scene, dispatch] = useScene();

    return (
        <Stack className={classNames.panel} tokens={stackTokens}>
            <ArenaShapeEdit />
            <ArenaGridEdit />
            <TextField
                label="Background image URL"
                value={scene.arena.backgroundImage}
                onChange={(ev, newValue) => {
                    dispatch({ type: 'arenaBackground', value: newValue });
                }}
            />
            <Section title="Presets">
                {ARENA_PRESETS.map((preset, i) => (
                    <PresetButton preset={preset} key={i} />
                ))}
            </Section>
        </Stack>
    );
};

interface PresetButtonProps {
    preset: ArenaPreset;
}

const PresetButton: React.FunctionComponent<PresetButtonProps> = ({ preset }) => {
    const [, dispatch] = useScene();

    const { name, ...arena } = preset;
    return (
        <DefaultButton
            text={name}
            onClick={() => {
                dispatch({ type: 'arena', value: arena });
            }}
        />
    );
};
