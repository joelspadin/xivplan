import * as React from 'react';
import { getDragOffset, usePanelDrag } from '../PanelDragProvider';
import { ObjectType } from '../scene';
import { PrefabIcon } from './PrefabIcon';

function makeIcon(name: string, icon: string) {
    // eslint-disable-next-line react/display-name
    return () => {
        const [, setDragObject] = usePanelDrag();
        const iconUrl = new URL(`../assets/marker/${icon}`, import.meta.url).toString();

        return (
            <PrefabIcon
                draggable
                name={name}
                icon={iconUrl}
                onDragStart={(e) => {
                    setDragObject({
                        object: {
                            type: ObjectType.Arrow,
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
}

export const DrawArrow = makeIcon('Arrow', 'arrow.png');
