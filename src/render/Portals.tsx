import React, { PropsWithChildren } from 'react';
import { Portal } from 'react-konva-utils';
import { LayerSelector } from './layers';

export interface PortalProps extends PropsWithChildren {
    isActive?: boolean;
}

/**
 * Conditionally renders an object on the active layer.
 */
export const ActivePortal: React.FC<PortalProps> = ({ isActive, children }) => {
    return (
        <Portal selector={LayerSelector.Active} enabled={isActive}>
            {children}
        </Portal>
    );
};

export const ForegroundPortal: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <Portal selector={LayerSelector.Foreground} enabled>
            {children}
        </Portal>
    );
};

export const ControlsPortal: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <Portal selector={LayerSelector.Controls} enabled>
            {children}
        </Portal>
    );
};
