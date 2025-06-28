import { useContext } from 'react';
import { DraggableCenterContext } from './DraggableCenterContext';

export function useDraggableCenter() {
    return useContext(DraggableCenterContext);
}
