import { createContext, type Dispatch, type SetStateAction } from 'react';

export type DefaultCursorState = [string, Dispatch<SetStateAction<string>>];

export const DefaultCursorContext = createContext<DefaultCursorState>(['default', () => undefined]);
