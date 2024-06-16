import { IconButton } from '@fluentui/react';
import { makeStyles, tokens } from '@fluentui/react-components';
import React, { ReactNode, useMemo } from 'react';
import { useScene } from '../SceneProvider';
import { getRecolorFilter } from '../color';
import { PrefabIcon } from '../prefabs/PrefabIcon';
import { SceneObject } from '../scene';

export interface DetailsItemProps {
    object: SceneObject;
    icon?: string | ReactNode;
    color?: string;
    name: string;
    isNested?: boolean;
}

export const DetailsItem: React.FC<DetailsItemProps> = ({ object, icon, name, color, isNested }) => {
    const classes = useStyles();
    const { dispatch } = useScene();
    const onDelete = () => dispatch({ type: 'remove', ids: object.id });

    const filter = useMemo(() => (color ? getRecolorFilter(color) : undefined), [color]);

    const size = isNested ? 20 : undefined;

    return (
        <div className={classes.wrapper}>
            <div>{icon && <PrefabIcon icon={icon} name={name} filter={filter} width={size} height={size} />}</div>
            <div className={classes.name}>{name}</div>
            {!isNested && <IconButton iconProps={{ iconName: 'Delete' }} onClick={onDelete} />}
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: {
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },

    name: {
        flexGrow: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
});
