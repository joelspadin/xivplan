import Konva from 'konva';
import { use } from 'react';
import { StageContext } from './StageContext';

export function useStage(): Konva.Stage | null {
    return use(StageContext);
}
