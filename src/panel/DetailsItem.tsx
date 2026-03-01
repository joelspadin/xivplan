import { Button, makeStyles, mergeClasses, tokens, typographyStyles } from '@fluentui/react-components';
import {
    bundleIcon,
    DismissFilled,
    DismissRegular,
    EyeFilled,
    EyeOffFilled,
    EyeOffRegular,
    EyeRegular,
} from '@fluentui/react-icons';
import React, { ReactNode } from 'react';
import { useScene } from '../SceneProvider';
import { EditMode } from '../editMode';
import { PrefabIcon } from '../prefabs/PrefabIcon';
import { SceneObject } from '../scene';
import { useEditMode } from '../useEditMode';
import { setOrOmit } from '../util';
import { detailsItemClassNames } from './detailsItemStyles';

export type DetailsItemSize = 'default' | 'nested' | 'field';

export interface DetailsItemProps {
    object: SceneObject;
    icon?: string | ReactNode;
    name: string;
    children?: ReactNode;
    isDragging?: boolean;
    isSelected?: boolean;
    showControls?: boolean;
    size?: DetailsItemSize;
}

// TODO: only show hide button if hidden or hovered/selected

export const DetailsItem: React.FC<DetailsItemProps> = ({
    object,
    icon,
    name,
    isDragging,
    isSelected,
    children,
    showControls,
    size,
}) => {
    const classes = useStyles();
    const [editMode] = useEditMode();

    const { className, iconSize } = getSizeProps(size ?? 'default', classes);

    return (
        <div className={mergeClasses(classes.wrapper, className)}>
            <div>{icon && <PrefabIcon icon={icon} name={name} width={iconSize} height={iconSize} />}</div>
            {children ? children : <div className={classes.name}>{name}</div>}
            {showControls && (
                <div className={classes.buttons}>
                    <DetailsItemHideButton
                        object={object}
                        className={mergeClasses(isSelected && classes.selectedButton, isDragging && classes.visible)}
                    />
                    {editMode != EditMode.SelectConnection && (
                        <DetailsItemDeleteButton
                            object={object}
                            className={mergeClasses(isSelected && classes.selectedButton)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

function getSizeProps(size: DetailsItemSize, classes: ReturnType<typeof useStyles>) {
    switch (size) {
        case 'nested':
            return { className: classes.nested, iconSize: 20 };

        case 'field':
            return { className: classes.insideField, iconSize: 20 };

        case 'default':
            return { className: undefined, iconSize: undefined };
    }
}

interface DetailsItemHideButtonProps {
    object: SceneObject;
    className?: string;
}

const EyeOffIcon = bundleIcon(EyeOffFilled, EyeOffRegular);
const EyeIcon = bundleIcon(EyeFilled, EyeRegular);

const DetailsItemHideButton: React.FC<DetailsItemHideButtonProps> = ({ object, className }) => {
    const classes = useStyles();
    const { dispatch } = useScene();
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        dispatch({ type: 'update', value: setOrOmit(object, 'hide', !object.hide) });
        e.stopPropagation();
    };

    const Icon = object.hide ? EyeOffIcon : EyeIcon;
    const tooltip = object.hide ? 'Show' : 'Hide';

    return (
        <Button
            appearance="transparent"
            className={mergeClasses(
                detailsItemClassNames.hideButton,
                classes.hideButton,
                object.hide && classes.visible,
                className,
            )}
            icon={<Icon />}
            onClick={handleClick}
            title={tooltip}
        />
    );
};

interface DetailsItemDeleteButtonProps {
    object: SceneObject;
    className?: string;
}

const DeleteIcon = bundleIcon(DismissFilled, DismissRegular);

const DetailsItemDeleteButton: React.FC<DetailsItemDeleteButtonProps> = ({ object, className }) => {
    const { dispatch } = useScene();
    const deleteObject = () => dispatch({ type: 'remove', ids: object.id });

    return (
        <Button
            appearance="transparent"
            className={className}
            icon={<DeleteIcon />}
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
        padding: tokens.spacingHorizontalXXS,
        gap: tokens.spacingHorizontalS,

        [`:hover .${detailsItemClassNames.hideButton}`]: {
            opacity: 1,
        },
    },

    name: {
        flexGrow: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },

    nested: {
        gap: tokens.spacingHorizontalXS,
        ...typographyStyles.caption1,
    },

    insideField: {
        gap: tokens.spacingHorizontalXXS,
        padding: '0',
        ...typographyStyles.caption1,
    },

    buttons: {
        display: 'flex',
        flexFlow: 'row',
    },

    hideButton: {
        opacity: 0,
        transitionProperty: 'opacity',
        transitionDuration: tokens.durationFaster,
        transitionTimingFunction: tokens.curveEasyEase,
    },

    visible: {
        opacity: 1,
    },

    selectedButton: {
        color: tokens.colorNeutralForegroundOnBrand,

        ':hover': {
            color: tokens.colorNeutralForegroundOnBrand,
        },
    },
});
