import { IStyle, mergeStyleSets } from '@fluentui/react';
import React from 'react';
import { Registry } from '../Registry';
import { SceneObject } from '../scene';
import { useScene } from '../SceneProvider';
import { useSelection } from '../SelectionProvider';
import { asArray } from '../util';
import { PANEL_PADDING } from './PanelStyles';

export interface PropertiesControlProps<T extends SceneObject = SceneObject> {
    object: T;
    index: number;
}

export type PropertiesControl<T extends SceneObject> = React.FC<PropertiesControlProps<T>>;

const registry = new Registry<PropertiesControlProps>();

export function registerPropertiesControl<T extends SceneObject>(
    ids: string | string[],
    component: PropertiesControl<T>,
): void {
    for (const id of asArray(ids)) {
        registry.register(id, component);
    }
}

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
    const [scene] = useScene();

    if (selection.size === 0) {
        return <p>No object selected.</p>;
    }
    if (selection.size > 1) {
        return <p>Multiple objects selected.</p>;
    }

    const index = selection.values().next().value;
    const object = scene.objects[index];

    if (!object) {
        return <p>Envalid selection.</p>;
    }

    const Component = registry.get(object.type);
    return <Component object={object} index={index} />;
};
