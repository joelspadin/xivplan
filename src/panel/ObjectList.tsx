import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { DragDropContext, Draggable, DropResult, Droppable } from '@hello-pangea/dnd';
import React, { useCallback } from 'react';
import { SceneObject } from '../scene';
import { addSelection, selectSingle, toggleSelection, useSelection } from '../selection';
import { reversed } from '../util';
import { getListComponent } from './ListComponentRegistry';

export type MoveCallback = (from: number, to: number) => void;

export interface ObjectListProps {
    objects: readonly SceneObject[];
    onMove: MoveCallback;
}

const DROP_ID = 'drop-id-objects';

function reversedIndex(i: number, length: number) {
    return length - 1 - i;
}

export const ObjectList: React.FC<ObjectListProps> = ({ objects, onMove }) => {
    const classes = useStyles();
    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (result.destination?.droppableId !== DROP_ID) {
                return;
            }

            onMove(
                reversedIndex(result.source.index, objects.length),
                reversedIndex(result.destination.index, objects.length),
            );
        },
        [objects.length, onMove],
    );

    // Objects are rendered with later objects on top, but it is more natural
    // to have the objects rendered on top be at the top of the list in the UI.
    const reversedObjects = [...reversed(objects)];

    return (
        <div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={DROP_ID}>
                    {(provided) => (
                        <div className={classes.list} {...provided.droppableProps} ref={provided.innerRef}>
                            {reversedObjects.map((object, index) => (
                                <ListItem object={object} key={object.id} index={index} />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export interface ListItemProps {
    index: number;
    object: SceneObject;
}

const ListItem: React.FC<ListItemProps> = ({ index, object }) => {
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

    return (
        <Draggable draggableId={object.id.toString()} index={index}>
            {(provided) => {
                return (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={mergeClasses(classes.item, isSelected && classes.selected)}
                        onClick={onClick}
                    >
                        <Component object={object} isSelected={isSelected} />
                    </div>
                );
            }}
        </Draggable>
    );
};

const useStyles = makeStyles({
    list: {
        padding: 0,
        margin: '0 0 20px',
        listStyle: 'none',
    },

    item: {
        minHeight: '32px',
        margin: '0 -2px',
        padding: '2px',
        display: 'block',
        borderRadius: tokens.borderRadiusMedium,

        transitionProperty: 'background, border, color',
        transitionDuration: tokens.durationFaster,
        transitionTimingFunction: tokens.curveEasyEase,

        backgroundColor: tokens.colorNeutralBackground3,

        ':hover': {
            backgroundColor: tokens.colorSubtleBackgroundHover,
        },
        ':hover:active': {
            backgroundColor: tokens.colorSubtleBackgroundPressed,
        },
    },
    selected: {
        backgroundColor: tokens.colorSubtleBackgroundSelected,
    },
});
