import { useContext } from 'react';
import { EditModeContext, EditModeState } from './EditModeContext';

export function useEditMode(): EditModeState {
    return useContext(EditModeContext);
}
