import { IconButton, IStackTokens, Stack } from '@fluentui/react';
import React from 'react';
import { PrefabIcon } from '../prefabs/PrefabIcon';
import { useScene } from '../SceneProvider';

const stackTokens: IStackTokens = {
    childrenGap: 8,
};

export interface DetailsItemProps {
    icon: string;
    name: string;
    index: number;
}

export const DetailsItem: React.FunctionComponent<DetailsItemProps> = ({ icon, name, index }) => {
    const [, dispatch] = useScene();
    const onDelete = () => dispatch({ type: 'remove', index });

    return (
        <Stack horizontal verticalAlign="center" tokens={stackTokens}>
            <PrefabIcon icon={icon} name={name} shouldFadeIn={false} />
            <Stack.Item grow>{name}</Stack.Item>
            <IconButton iconProps={{ iconName: 'Delete' }} onClick={onDelete} />
        </Stack>
    );
};
