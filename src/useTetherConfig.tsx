import { useContext } from 'react';
import { TetherConfigContext, TetherConfigState } from './EditModeProvider';

export function useTetherConfig(): TetherConfigState {
    return useContext(TetherConfigContext);
}
