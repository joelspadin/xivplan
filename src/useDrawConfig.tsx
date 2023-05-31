import { useContext } from 'react';
import { DrawConfigContext, DrawConfigState } from './EditModeProvider';

export function useDrawConfig(): DrawConfigState {
    return useContext(DrawConfigContext);
}
