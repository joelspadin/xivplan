import Konva from 'konva';
import { useContext } from 'react';
import { StageContext } from './StageContext';

export function useStage(): Konva.Stage | null {
    return useContext(StageContext);
}
