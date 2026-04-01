import { useContext } from 'react';
import { TetherConfigContext, type TetherConfigState } from './EditModeContext';

export function useTetherConfig(): TetherConfigState {
    return useContext(TetherConfigContext);
}
