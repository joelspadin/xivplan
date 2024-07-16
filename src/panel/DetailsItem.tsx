import { Button, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { bundleIcon, DismissFilled, DismissRegular } from '@fluentui/react-icons';
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
    isSelected?: boolean;
}

export const DetailsItem: React.FC<DetailsItemProps> = ({ object, icon, name, color, isNested, isSelected }) => {
    const classes = useStyles();
    const filter = useMemo(() => (color ? getRecolorFilter(color) : undefined), [color]);

    const size = isNested ? 20 : undefined;

    return (
        <div className={classes.wrapper}>
            <div>{icon && <PrefabIcon icon={icon} name={name} filter={filter} width={size} height={size} />}</div>
            <div className={classes.name}>{name}</div>
            {!isNested && <DetailsItemDeleteButton object={object} isSelected={isSelected} />}
        </div>
    );
};

export interface DetailsItemDeleteButtonProps {
    object: SceneObject;
    isSelected?: boolean;
}

const DeleteIcon = bundleIcon(DismissFilled, DismissRegular);

export const DetailsItemDeleteButton: React.FC<DetailsItemDeleteButtonProps> = ({ object, isSelected }) => {
    const classes = useStyles();
    const { dispatch } = useScene();
    const deleteObject = () => dispatch({ type: 'remove', ids: object.id });

    return (
        <Button
            appearance="transparent"
            icon={<DeleteIcon className={mergeClasses(isSelected && classes.selectedIcon)} />}
            onClick={deleteObject}
            title="Delete object"
        />
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

    selectedIcon: {
        color: tokens.colorNeutralForegroundStaticInverted,
    },
});
