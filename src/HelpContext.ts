import { createContext, type Dispatch, type SetStateAction } from 'react';

export type HelpState = [boolean, Dispatch<SetStateAction<boolean>>];

export const HelpContext = createContext<HelpState>([false, () => {}]);
