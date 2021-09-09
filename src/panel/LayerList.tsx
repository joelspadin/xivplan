import { IStyle, mergeStyleSets, Separator } from '@fluentui/react';
import React, { useCallback } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Registry } from '../Registry';
import { SceneObject } from '../scene';

const classNames = mergeStyleSets({
    list: {
        padding: 0,
        margin: '0 0 20px',
        listStyle: 'none',

        li: {
            minHeight: 32,
            padding: '2px 0',
            display: 'flex',
            flexFlow: 'row',
        } as IStyle,
    } as IStyle,
    dragTarget: {} as IStyle,
    dragging: {} as IStyle,
});

export interface ListComponentProps<T extends SceneObject = SceneObject> {
    object: T;
}

export type ListComponent<T extends SceneObject> = React.FunctionComponent<ListComponentProps<T>>;

const registry = new Registry<ListComponentProps>();

export function registerListComponent<T extends SceneObject>(id: string, component: ListComponent<T>): void {
    registry.register(id, component);
}

export type MoveCallback = (from: number, to: number) => void;

export interface LayerListProps {
    headerText: string;
    layer: string;
    objects: SceneObject[];
    onMove: MoveCallback;
}

export const LayerList: React.FunctionComponent<LayerListProps> = ({ headerText, layer, objects, onMove }) => {
    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (result.destination?.droppableId !== layer) {
                return;
            }

            onMove(result.source.index, result.destination.index);
        },
        [layer, onMove],
    );

    // TODO: reversed order would make more sense
    return (
        <div>
            <Separator>{headerText}</Separator>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={layer}>
                    {(provided, snapshot) => (
                        <ul
                            className={`${classNames.list} ${snapshot.isDraggingOver ? classNames.dragTarget : ''}`}
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {objects.map((object, key) => (
                                <ListItem object={object} key={key} index={key} />
                            ))}
                            {provided.placeholder}
                        </ul>
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

const ListItem: React.FunctionComponent<ListItemProps> = ({ index, object }) => {
    const Component = registry.get(object.type);

    return (
        <Draggable draggableId={index.toString()} index={index}>
            {(provided, snapshot) => (
                <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? classNames.dragging : ''}
                >
                    <Component object={object} />
                </li>
            )}
        </Draggable>
    );
};
