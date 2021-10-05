import { classNamesFunction, IStyle, mergeStyleSets, Separator, Theme, useTheme } from '@fluentui/react';
import React, { useCallback } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Registry } from '../Registry';
import { SceneObject } from '../scene';
import { EditList } from '../SceneProvider';
import { useSelection } from '../SelectionProvider';
import { makeClassName, reversed } from '../util';

const listClassNames = mergeStyleSets({
    list: {
        padding: 0,
        margin: '0 0 20px',
        listStyle: 'none',
    } as IStyle,
});

export interface ListComponentProps<T extends SceneObject = SceneObject> {
    object: T;
    layer: EditList;
    index: number;
    isSelected: boolean;
}

export type ListComponent<T extends SceneObject> = React.FunctionComponent<ListComponentProps<T>>;

const registry = new Registry<ListComponentProps>();

export function registerListComponent<T extends SceneObject>(
    ids: string | string[],
    component: ListComponent<T>,
): void {
    ids = Array.isArray(ids) ? ids : [ids];
    for (const id of ids) {
        registry.register(id, component);
    }
}

export type MoveCallback = (from: number, to: number) => void;

export interface LayerListProps {
    headerText: string;
    layer: EditList;
    objects: SceneObject[];
    onMove: MoveCallback;
}

function dropId(layer: EditList) {
    return `drop-layer-${layer}`;
}

function reversedIndex(i: number, length: number) {
    return length - 1 - i;
}

export const LayerList: React.FunctionComponent<LayerListProps> = ({ headerText, layer, objects, onMove }) => {
    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (result.destination?.droppableId !== dropId(layer)) {
                return;
            }

            onMove(
                reversedIndex(result.source.index, objects.length),
                reversedIndex(result.destination.index, objects.length),
            );
        },
        [layer, objects.length, onMove],
    );

    // Objects are rendered with later objects on top, but it is more natural
    // to have the objects rendered on top be at the top of the list in the UI.
    const reversedObjects = [...reversed(objects)];

    return (
        <div>
            <Separator>{headerText}</Separator>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={dropId(layer)}>
                    {(provided) => (
                        <ul className={listClassNames.list} {...provided.droppableProps} ref={provided.innerRef}>
                            {reversedObjects.map((object, key) => (
                                <ListItem
                                    object={object}
                                    key={key}
                                    index={key}
                                    sceneIndex={reversedIndex(key, objects.length)}
                                    layer={layer}
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
    layer: EditList;
}

const ListItem: React.FunctionComponent<ListItemProps> = ({ index, sceneIndex, object, layer }) => {
    const [selection, setSelection] = useSelection();
    const isSelected = layer === selection?.layer && sceneIndex === selection.index;

    const onClick = useCallback(() => {
        setSelection({ layer, index: sceneIndex });
    }, [sceneIndex, layer, setSelection]);

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
        <Draggable draggableId={sceneIndex.toString()} index={index}>
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
                        <Component object={object} layer={layer} index={sceneIndex} isSelected={isSelected} />
                    </li>
                );
            }}
        </Draggable>
    );
};
