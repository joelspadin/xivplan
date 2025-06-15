import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { makeStyles, mergeClasses, shorthands, tokens } from '@fluentui/react-components';
import React, { useCallback, useMemo } from 'react';
import { SceneObject } from '../scene';
import { addSelection, selectSingle, toggleSelection, useSelection } from '../selection';
import { reversed } from '../util';
import { getListComponent } from './ListComponentRegistry';

export type MoveCallback = (from: number, to: number) => void;

export interface ObjectListProps {
    objects: readonly SceneObject[];
    onMove: MoveCallback;
}

function getObjectIndex(objects: readonly SceneObject[], id: number) {
    return objects.findIndex((o) => o.id === id);
}

export const ObjectList: React.FC<ObjectListProps> = ({ objects, onMove }) => {
    const classes = useStyles();

    // Objects are rendered with later objects on top, but it is more natural
    // to have the objects rendered on top be at the top of the list in the UI.
    const reversedObjects = useMemo(() => [...reversed(objects)], [objects]);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = useCallback(
        (ev: DragEndEvent) => {
            const { active, over } = ev;

            if (over && active.id !== over.id) {
                onMove(getObjectIndex(objects, active.id as number), getObjectIndex(objects, over.id as number));
            }
        },
        [objects, onMove],
    );

    return (
        <div className={classes.list}>
            <DndContext
                sensors={sensors}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={reversedObjects} strategy={verticalListSortingStrategy}>
                    {reversedObjects.map((object) => (
                        <SortableItem key={object.id} object={object} />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};

interface SortableItemProps {
    object: SceneObject;
}

const SortableItem: React.FC<SortableItemProps> = ({ object }) => {
    const classes = useStyles();
    const [selection, setSelection] = useSelection();
    const isSelected = selection.has(object.id);

    const onClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.shiftKey) {
                setSelection(addSelection(selection, object.id));
            } else if (e.ctrlKey) {
                setSelection(toggleSelection(selection, object.id));
            } else {
                setSelection(selectSingle(object.id));
            }
        },
        [object.id, selection, setSelection],
    );

    const Component = getListComponent(object);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: object.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={mergeClasses(isDragging && classes.draggingWrapper)}
            onClick={onClick}
            {...attributes}
            {...listeners}
        >
            <div
                className={mergeClasses(
                    classes.item,
                    isSelected && classes.selected,
                    isDragging && classes.dragging,
                    isDragging && isSelected && classes.draggingSelected,
                )}
            >
                <Component object={object} isDragging={isDragging} isSelected={isSelected} />
            </div>
        </div>
    );
};

const useStyles = makeStyles({
    list: {
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalXXS,

        padding: 0,
        ...shorthands.margin(0, `-${tokens.spacingHorizontalXXS}`, tokens.spacingVerticalXL),
        listStyle: 'none',
    },

    draggingWrapper: {
        position: 'relative',
        zIndex: 1,
    },

    item: {
        display: 'block',
        zIndex: 0,

        minHeight: '32px',
        borderRadius: tokens.borderRadiusMedium,

        transitionProperty: 'background, border, color',
        transitionDuration: tokens.durationFaster,
        transitionTimingFunction: tokens.curveEasyEase,

        backgroundColor: tokens.colorNeutralBackground3,

        ':hover': {
            backgroundColor: tokens.colorNeutralBackground3Hover,
        },
        ':hover:active': {
            backgroundColor: tokens.colorNeutralBackground3Pressed,
        },
    },

    selected: {
        color: tokens.colorNeutralForegroundOnBrand,
        backgroundColor: tokens.colorBrandBackgroundSelected,

        ':hover': {
            backgroundColor: tokens.colorBrandBackgroundHover,
        },
        ':hover:active': {
            backgroundColor: tokens.colorBrandBackgroundPressed,
        },
    },

    dragging: {
        backgroundColor: tokens.colorNeutralBackground3Pressed,
    },

    draggingSelected: {
        backgroundColor: tokens.colorBrandBackgroundPressed,
    },
});
