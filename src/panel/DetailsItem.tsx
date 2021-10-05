import { IconButton, IStackTokens, Stack } from '@fluentui/react';
import React from 'react';
import { getDeleteAction } from '../actions';
import { PrefabIcon } from '../prefabs/PrefabIcon';
import { EditList, useScene } from '../SceneProvider';

const stackTokens: IStackTokens = {
    childrenGap: 8,
};

export interface DetailsItemProps {
    icon: string;
    name: string;
    layer: EditList;
    index: number;
}

export const DetailsItem: React.FunctionComponent<DetailsItemProps> = ({ icon, name, layer, index }) => {
    const [, dispatch] = useScene();
    const onDelete = () => dispatch(getDeleteAction(layer, index));

    return (
        <Stack horizontal verticalAlign="center" tokens={stackTokens}>
            <PrefabIcon icon={icon} name={name} shouldFadeIn={false} />
            <Stack.Item grow>{name}</Stack.Item>
            <IconButton iconProps={{ iconName: 'Delete' }} onClick={onDelete} />
        </Stack>
    );
};
