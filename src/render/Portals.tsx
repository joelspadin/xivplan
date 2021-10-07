import React from 'react';
import { Portal } from 'react-konva-utils';
import { LayerSelector } from './layers';

export const ArenaPortal: React.FC = ({ children }) => {
    return (
        <Portal selector={LayerSelector.Arena} enabled>
            {children}
        </Portal>
    );
};

/**
 * Renders an object on the ground object layer.
 */
export const GroundPortal: React.FC = ({ children }) => {
    return (
        <Portal selector={LayerSelector.Ground} enabled>
            {children}
        </Portal>
    );
};
