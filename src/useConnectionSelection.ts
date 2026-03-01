import { useContext } from 'react';
import { ConnectionSelectionContext } from './EditModeContext';

export function useConnectionSelection() {
    return useContext(ConnectionSelectionContext);
}
