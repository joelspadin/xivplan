import { IconButton, IStackTokens, IStyle, mergeStyleSets, Stack } from '@fluentui/react';
import React, { useMemo } from 'react';
import { getRecolorFilter } from '../color';
import { PrefabIcon } from '../prefabs/PrefabIcon';
import { SceneObject } from '../scene';
import { useScene } from '../SceneProvider';

const stackTokens: IStackTokens = {
    childrenGap: 8,
};

export interface DetailsItemProps {
    object: SceneObject;
    icon?: string;
    color?: string;
    name: string;
    isNested?: boolean;
}

const classNames = mergeStyleSets({
    name: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    } as IStyle,
});

export const DetailsItem: React.FC<DetailsItemProps> = ({ object, icon, name, color, isNested }) => {
    const { dispatch } = useScene();
    const onDelete = () => dispatch({ type: 'remove', ids: object.id });

    const filter = useMemo(() => (color ? getRecolorFilter(color) : undefined), [color]);

    const size = isNested ? 20 : undefined;

    return (
        <Stack horizontal verticalAlign="center" tokens={stackTokens}>
            <Stack.Item>
                {icon && (
                    <PrefabIcon
                        icon={icon}
                        name={name}
                        filter={filter}
                        shouldFadeIn={false}
                        width={size}
                        height={size}
                    />
                )}
            </Stack.Item>
            <Stack.Item grow className={classNames.name}>
                {name}
            </Stack.Item>
            {!isNested && <IconButton iconProps={{ iconName: 'Delete' }} onClick={onDelete} />}
        </Stack>
    );
};
