import { mergeClasses } from '@fluentui/react-components';
import React from 'react';
import { useControlStyles } from '../useControlStyles';
import { Section } from './Section';
import { SwapIconsControl } from './SwapIconsControl';

export interface ToolsPanelProps {
    className?: string;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ className }) => {
    const classes = useControlStyles();

    return (
        <div className={mergeClasses(classes.panel, classes.noSelect, className)}>
            <Section title="Swap Icons">
                <SwapIconsControl />
            </Section>
        </div>
    );
};
