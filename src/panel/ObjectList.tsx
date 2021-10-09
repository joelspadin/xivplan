import { classNamesFunction, IStyle, mergeStyleSets, Theme, useTheme } from '@fluentui/react';
import React, { useCallback } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Registry } from '../Registry';
import { SceneObject } from '../scene';
import { addSelection, selectSingle, toggleSelection, useSelection } from '../SelectionProvider';
import { asArray, makeClassName, reversed } from '../util';

const listClassNames = mergeStyleSets({
    list: {
        padding: 0,
        margin: '0 0 20px',
        listStyle: 'none',
    } as IStyle,
});

export interface ListComponentProps<T extends SceneObject = SceneObject> {
    object: T;
    index: number;
    isSelected: boolean;
}

export type ListComponent<T extends SceneObject> = React.FunctionComponent<ListComponentProps<T>>;

const registry = new Registry<ListComponentProps>();

export function registerListComponent<T extends SceneObject>(
    ids: string | string[],
    component: ListComponent<T>,
): void {
    for (const id of asArray(ids)) {
        registry.register(id, component);
    }
}

export type MoveCallback = (from: number, to: number) => void;

export interface ObjectListProps {
    objects: readonly SceneObject[];
    onMove: MoveCallback;
}

const DROP_ID = 'drop-id-objects';

function reversedIndex(i: number, length: number) {
    return length - 1 - i;
}

export const ObjectList: React.FunctionComponent<ObjectListProps> = ({ objects, onMove }) => {
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
                        <ul className={listClassNames.list} {...provided.droppableProps} ref={provided.innerRef}>
                            {reversedObjects.map((object, index) => (
                                <ListItem
                                    object={object}
                                    key={object.id}
                                    index={index}
                                    sceneIndex={reversedIndex(index, objects.length)}
                                />
                            ))}
                            {provided.placeholder}
                        </ul>
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
    sceneIndex: number;
    object: SceneObject;
}

const ListItem: React.FunctionComponent<ListItemProps> = ({ index, sceneIndex, object }) => {
    const [selection, setSelection] = useSelection();
    const isSelected = selection.has(sceneIndex);

    const onClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.shiftKey) {
                setSelection(addSelection(selection, sceneIndex));
            } else if (e.ctrlKey) {
                setSelection(toggleSelection(selection, sceneIndex));
            } else {
                setSelection(selectSingle(sceneIndex));
            }
        },
        [sceneIndex, selection, setSelection],
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

    const Component = registry.get(object.type);

    return (
        <Draggable draggableId={object.id.toString()} index={index}>
            {(provided, snapshot) => {
                const className = makeClassName({
                    [classNames.root]: true,
                    [classNames.dragging]: snapshot.isDragging,
                    [classNames.selected]: isSelected,
                });

                return (
                    <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={className}
                        onClick={onClick}
                    >
                        <Component object={object} index={sceneIndex} isSelected={isSelected} />
                    </li>
                );
            }}
        </Draggable>
    );
};
