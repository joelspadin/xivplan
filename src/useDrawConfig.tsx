import { useContext } from 'react';
import { DrawConfigContext, type DrawConfigState } from './EditModeContext';

export function useDrawConfig(): DrawConfigState {
    return useContext(DrawConfigContext);
}
