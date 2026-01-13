import { useContext } from 'react';
import { EditModeContext, EditModeState } from './EditModeContext';
import { EditMode } from './editMode';

export function useEditMode(): EditModeState {
    return useContext(EditModeContext);
}

export function useCancelConnectionSelection(): () => void {
    const [editMode, setEditMode] = useEditMode();
    return () => {
        if (editMode == EditMode.SelectConnection) {
            setEditMode(EditMode.Normal);
        }
    };
}
