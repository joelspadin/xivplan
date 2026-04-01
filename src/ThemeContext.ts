import { createContext, type Dispatch } from 'react';

export type DarkModeValue = [boolean, Dispatch<boolean>];

export const DarkModeContext = createContext<DarkModeValue>([false, () => undefined]);
