import { createContext } from 'react';
import { createHtmlPortalNode } from 'react-reverse-portal';

export const ToolbarContext = createContext(createHtmlPortalNode());
