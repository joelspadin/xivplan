import { IButtonProps, IButtonStyles, IconButton, useTheme } from '@fluentui/react';
import React, { useMemo } from 'react';
import { PREFAB_ICON_SIZE } from './PrefabIconStyles';

export interface PrefabToggleProps extends IButtonProps {
    icon: string;
    name?: string;
    checked?: boolean;
}

export const PrefabToggle: React.FC<PrefabToggleProps> = ({ icon, name, checked, ...props }) => {
    const theme = useTheme();

    const buttonStyles = useMemo<IButtonStyles>(() => {
        return {
            icon: {
                fontSize: PREFAB_ICON_SIZE,
                height: PREFAB_ICON_SIZE,
                lineHeight: PREFAB_ICON_SIZE,
            },
            rootChecked: {
                border: `1px solid ${theme.palette.themeSecondary}`,
            },
        };
    }, [theme]);

    return (
        <IconButton
            {...props}
            title={name}
            checked={checked}
            iconProps={{
                imageProps: {
                    src: icon,
                },
            }}
            styles={buttonStyles}
        />
    );
};
