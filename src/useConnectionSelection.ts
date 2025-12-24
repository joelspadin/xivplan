import { useContext } from 'react';
import { ConnectionSelectionConfigContext } from './EditModeContext';

export function useConnectionSelection() {
    return useContext(ConnectionSelectionConfigContext);
}
