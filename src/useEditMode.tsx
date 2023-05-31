import { useContext } from 'react';
import { EditModeContext, EditModeState } from './EditModeProvider';

export function useEditMode(): EditModeState {
    return useContext(EditModeContext);
}
