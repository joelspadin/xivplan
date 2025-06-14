import { useContext } from 'react';
import { ObjectContext } from './ObjectContext';

export function useObject() {
    return useContext(ObjectContext);
}
