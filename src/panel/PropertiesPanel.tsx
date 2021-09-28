import { IStyle, mergeStyleSets } from '@fluentui/react';
import React from 'react';
import { Registry } from '../Registry';
import { SceneObject } from '../scene';
import { EditList } from '../SceneProvider';
import { useSelectedObject } from '../SelectionProvider';
import { PANEL_PADDING } from './PanelStyles';

export interface PropertiesControlProps<T extends SceneObject = SceneObject> {
    object: T;
    layer: EditList;
    index: number;
}

export type PropertiesControl<T extends SceneObject> = React.FC<PropertiesControlProps<T>>;

const registry = new Registry<PropertiesControlProps>();

export function registerPropertiesControl<T extends SceneObject>(id: string, component: PropertiesControl<T>): void {
    registry.register(id, component);
}

const classNames = mergeStyleSets({
    root: {
        padding: PANEL_PADDING,
    } as IStyle,
});

export const PropertiesPanel: React.FC = () => {
    const selectedObject = useSelectedObject();

    return (
        <div className={classNames.root}>
            {selectedObject ? <Controls {...selectedObject} /> : <p>No object selected.</p>}
        </div>
    );
};

export const Controls: React.FC<PropertiesControlProps> = ({ object, layer, index }) => {
    const Component = registry.get(object.type);
    return <Component object={object} layer={layer} index={index} />;
};
