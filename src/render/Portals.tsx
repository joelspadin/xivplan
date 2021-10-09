import React from 'react';
import { Portal } from 'react-konva-utils';
import { LayerSelector } from './layers';

export interface PortalProps {
    isActive?: boolean;
}

export const ArenaPortal: React.FC<PortalProps> = ({ isActive, children }) => {
    return (
        <Portal selector={isActive ? LayerSelector.Active : LayerSelector.Arena} enabled>
            {children}
        </Portal>
    );
};

/**
 * Renders an object on the ground object layer.
 */
export const GroundPortal: React.FC<PortalProps> = ({ isActive, children }) => {
    return (
        <Portal selector={isActive ? LayerSelector.Active : LayerSelector.Ground} enabled>
            {children}
        </Portal>
    );
};

/**
 * Conditionally renders an object on the active layer.
 */
export const DefaultPortal: React.FC<PortalProps> = ({ isActive, children }) => {
    return (
        <Portal selector={LayerSelector.Active} enabled={isActive}>
            {children}
        </Portal>
    );
};

/**
 * Renders an object on the tether layer.
 */
export const TetherPortal: React.FC<PortalProps> = ({ isActive, children }) => {
    return (
        <Portal selector={isActive ? LayerSelector.Active : LayerSelector.Tether} enabled>
            {children}
        </Portal>
    );
};
