import * as React from 'react';
import { getDragOffset, usePanelDrag } from '../PanelDragProvider';
import { getUrl } from '../util';
import { PrefabIcon } from './PrefabIcon';

const ARROW_TYPE = 'arrow';

function makeIcon(name: string, icon: string) {
    // eslint-disable-next-line react/display-name
    return () => {
        const [, setDragObject] = usePanelDrag();
        const iconUrl = getUrl(`../assets/marker/${icon}`, import.meta.url);

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
