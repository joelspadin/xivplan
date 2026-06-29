import React, { PropsWithChildren, useState } from 'react';
import { CrossStepContext, CrossStepSelection, DEFAULT_FILTERS, SimilarityFilters } from './CrossStepContext';
import { DragSelectionContext, SceneSelection, SelectionContext, SpotlightContext } from './SelectionContext';

export const SelectionProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const state = useState<SceneSelection>(new Set());
    const dragState = useState<SceneSelection>(new Set());
    const spotlightState = useState<SceneSelection>(new Set());
    const [crossStepSelection, setCrossStepSelection] = useState<CrossStepSelection>(new Map());
    const [filters, setFilters] = useState<SimilarityFilters>(DEFAULT_FILTERS);
    const [positionTolerance, setPositionTolerance] = useState(0);

    return (
        <SelectionContext value={state}>
            <SpotlightContext value={spotlightState}>
                <DragSelectionContext value={dragState}>
                    <CrossStepContext
                        value={{
                            selection: crossStepSelection,
                            setSelection: setCrossStepSelection,
                            filters,
                            setFilters,
                            positionTolerance,
                            setPositionTolerance,
                        }}
                    >
                        {children}
                    </CrossStepContext>
                </DragSelectionContext>
            </SpotlightContext>
        </SelectionContext>
    );
};
