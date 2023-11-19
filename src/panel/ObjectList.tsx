import { classNamesFunction, IStyle, mergeStyleSets, Theme, useTheme } from '@fluentui/react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import React, { useCallback } from 'react';
import { SceneObject } from '../scene';
import { addSelection, selectSingle, toggleSelection, useSelection } from '../selection';
import { makeClassName, reversed } from '../util';
import { getListComponent } from './ListComponentRegistry';

const listClassNames = mergeStyleSets({
    list: {
        padding: 0,
        margin: '0 0 20px',
        listStyle: 'none',
    } as IStyle,
});

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
                        <div className={listClassNames.list} {...provided.droppableProps} ref={provided.innerRef}>
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

interface IListItemStyles {
    root: IStyle;
    dragging: IStyle;
    selected: IStyle;
}

const getListItemClassNames = classNamesFunction<Theme, IListItemStyles>();

export interface ListItemProps {
    index: number;
    object: SceneObject;
}

const ListItem: React.FC<ListItemProps> = ({ index, object }) => {
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

    const theme = useTheme();
    const classNames = getListItemClassNames(
        () => ({
            root: {
                minHeight: 32,
                margin: '0 -2px',
                padding: 2,
                display: 'block',
                borderRadius: theme.effects.roundedCorner2,
                ':hover': {
                    backgroundColor: theme.semanticColors.listItemBackgroundHovered,
                },
            },
            dragging: {},
            selected: {
                backgroundColor: theme.semanticColors.listItemBackgroundChecked,
                ':hover': {
                    backgroundColor: theme.semanticColors.listItemBackgroundCheckedHovered,
                },
            },
        }),
        theme,
    );

    const Component = getListComponent(object);

    return (
        <Draggable draggableId={object.id.toString()} index={index}>
            {(provided, snapshot) => {
                const className = makeClassName({
                    [classNames.root]: true,
                    [classNames.dragging]: snapshot.isDragging,
                    [classNames.selected]: isSelected,
                });

                return (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={className}
                        onClick={onClick}
                    >
                        <Component object={object} isSelected={isSelected} />
                    </div>
                );
            }}
        </Draggable>
    );
};
