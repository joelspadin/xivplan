import { useContext } from 'react';
import { PanelDragContext, PanelDragObject, PanelDragState } from './PanelDragContext';
import { EditMode } from './editMode';
import { useEditMode } from './useEditMode';

export function usePanelDrag(): PanelDragState {
    const [dragObject, setDragObject] = useContext(PanelDragContext);
    const [, setEditMode] = useEditMode();

    const wrappedSet = (value: PanelDragObject | null) => {
        // Drag and dropping an object should cancel tether inputs.
        setEditMode(EditMode.Normal);
        setDragObject(value);
    };

    return [dragObject, wrappedSet];
}
