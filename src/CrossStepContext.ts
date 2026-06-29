import { createContext, Dispatch, SetStateAction, use } from 'react';

export interface SimilarityFilters {
    trackId: boolean;
    properties: boolean;
    position: boolean;
}

export const DEFAULT_FILTERS: SimilarityFilters = { trackId: false, properties: false, position: false };

/** Maps stepIndex → set of objectIds selected on that step for cross-step editing. */
export type CrossStepSelection = ReadonlyMap<number, ReadonlySet<number>>;

export interface CrossStepContextValue {
    selection: CrossStepSelection;
    setSelection: Dispatch<SetStateAction<CrossStepSelection>>;
    filters: SimilarityFilters;
    setFilters: Dispatch<SetStateAction<SimilarityFilters>>;
    positionTolerance: number;
    setPositionTolerance: Dispatch<SetStateAction<number>>;
}

export const CrossStepContext = createContext<CrossStepContextValue>({
    selection: new Map(),
    setSelection: () => undefined,
    filters: DEFAULT_FILTERS,
    setFilters: () => undefined,
    positionTolerance: 0,
    setPositionTolerance: () => undefined,
});

export function useCrossStepContext(): CrossStepContextValue {
    return use(CrossStepContext);
}
