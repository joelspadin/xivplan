import { initializeIcons } from '@fluentui/react';
import Konva from 'konva';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import './index.css';

initializeIcons();

Konva.angleDeg = true;

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root'),
);
