import { useContext } from 'react';
import { DrawConfigContext, DrawConfigState } from './EditModeContext';

export function useDrawConfig(): DrawConfigState {
    return useContext(DrawConfigContext);
}
