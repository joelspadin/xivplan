import { use } from 'react';
import { ConnectionSelectionContext } from './EditModeContext';

export function useConnectionSelection() {
    return use(ConnectionSelectionContext);
}
