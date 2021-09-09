import * as React from 'react';
import { getDragOffset, usePanelDrag } from '../PanelDragProvider';
import { PrefabIcon } from './PrefabIcon';

const ARROW_TYPE = 'arrow';

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
                        type: ARROW_TYPE,
                        object: {
                            type: 'arrow',
                        },
                        offset: getDragOffset(e),
                    });
                }}
            />
        );
    };
}

export const DrawArrow = makeIcon('Arrow', 'arrow.png');
