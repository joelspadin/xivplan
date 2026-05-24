import { createContext, type Dispatch, type SetStateAction } from 'react';

export type PartyTabs = 'roles' | 'jobs';

export const PartyTabContext = createContext<[PartyTabs, Dispatch<SetStateAction<PartyTabs>>]>(['roles', () => {}]);
