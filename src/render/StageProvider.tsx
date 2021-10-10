import Konva from 'konva';
import React, { useContext } from 'react';

export const StageContext = React.createContext<Konva.Stage | null>(null);

export function useStage(): Konva.Stage | null {
    return useContext(StageContext);
}
