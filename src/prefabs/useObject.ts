import { use } from 'react';
import { ObjectContext } from './ObjectContext';

export function useObject() {
    return use(ObjectContext);
}
