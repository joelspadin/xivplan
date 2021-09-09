import { IStackTokens, Stack } from '@fluentui/react';
import React from 'react';
import { PrefabIcon } from '../prefabs/PrefabIcon';

const stackTokens: IStackTokens = {
    childrenGap: 8,
};

export interface DetailsItemProps {
    icon: string;
    name: string;
}

export const DetailsItem: React.FunctionComponent<DetailsItemProps> = ({ icon, name }) => {
    return (
        <Stack horizontal verticalAlign="center" tokens={stackTokens}>
            <PrefabIcon icon={icon} name={name} shouldFadeIn={false} />
            <Stack.Item>{name}</Stack.Item>
        </Stack>
    );
};
