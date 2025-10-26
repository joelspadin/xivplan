import React, { PropsWithChildren, useState } from 'react';
import { DragSelectionContext, SceneSelection, SelectionContext, SpotlightContext } from './SelectionContext';

export const SelectionProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const state = useState<SceneSelection>(new Set());
    const dragState = useState<SceneSelection>(new Set());
    const spotlightState = useState<SceneSelection>(new Set());

    return (
        <SelectionContext value={state}>
            <SpotlightContext value={spotlightState}>
                <DragSelectionContext value={dragState}>{children}</DragSelectionContext>
            </SpotlightContext>
        </SelectionContext>
    );
};
