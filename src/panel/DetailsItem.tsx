import { IconButton, IStackTokens, IStyle, mergeStyleSets, Stack } from '@fluentui/react';
import React from 'react';
import { PrefabIcon } from '../prefabs/PrefabIcon';
import { SceneObject } from '../scene';
import { useScene } from '../SceneProvider';

const stackTokens: IStackTokens = {
    childrenGap: 8,
};

export interface DetailsItemProps {
    object: SceneObject;
    icon: string;
    name: string;
}

const classNames = mergeStyleSets({
    name: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    } as IStyle,
});

export const DetailsItem: React.FunctionComponent<DetailsItemProps> = ({ object, icon, name }) => {
    const [, dispatch] = useScene();
    const onDelete = () => dispatch({ type: 'remove', ids: object.id });

    return (
        <Stack horizontal verticalAlign="center" tokens={stackTokens}>
            <Stack.Item>
                <PrefabIcon icon={icon} name={name} shouldFadeIn={false} />
            </Stack.Item>
            <Stack.Item grow className={classNames.name}>
                {name}
            </Stack.Item>
            <IconButton iconProps={{ iconName: 'Delete' }} onClick={onDelete} />
        </Stack>
    );
};
