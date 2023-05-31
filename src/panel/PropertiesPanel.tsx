import { IStyle, mergeStyleSets } from '@fluentui/react';
import React from 'react';
import { useCurrentStep } from '../SceneProvider';
import { getSelectedObjects, useSelection } from '../selection';
import { PANEL_PADDING } from './PanelStyles';
import { getPropertiesControl } from './PropertiesControlRegistry';

const classNames = mergeStyleSets({
    root: {
        padding: PANEL_PADDING,
    } as IStyle,
});

export const PropertiesPanel: React.FC = () => {
    return (
        <div className={classNames.root}>
            <Controls />
        </div>
    );
};

const Controls: React.FC = () => {
    const [selection] = useSelection();
    const step = useCurrentStep();

    if (selection.size === 0) {
        return <p>No object selected.</p>;
    }
    if (selection.size > 1) {
        return <p>Multiple objects selected.</p>;
    }

    const object = getSelectedObjects(step, selection)[0];

    if (!object) {
        return <p>Invalid selection.</p>;
    }

    const Component = getPropertiesControl(object);
    return <Component object={object} />;
};
