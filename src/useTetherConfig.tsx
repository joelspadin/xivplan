import { useContext } from 'react';
import { TetherConfigContext, TetherConfigState } from './EditModeContext';

export function useTetherConfig(): TetherConfigState {
    return useContext(TetherConfigContext);
}
