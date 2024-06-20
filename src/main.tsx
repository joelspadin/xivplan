import Konva from 'konva';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

Konva.angleDeg = true;

const container = document.getElementById('root');
if (!container) {
    throw new Error('Missing #root element');
}

const root = createRoot(container);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
