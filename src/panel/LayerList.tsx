import { classNamesFunction, IStyle, mergeStyleSets, Separator, Theme, useTheme } from '@fluentui/react';
import React, { useCallback } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Registry } from '../Registry';
import { SceneObject } from '../scene';
import { EditList } from '../SceneProvider';
import { useSelection } from '../SelectionProvider';
import { makeClassName } from '../util';

const listClassNames = mergeStyleSets({
    list: {
        padding: 0,
        margin: '0 0 20px',
        listStyle: 'none',
    } as IStyle,
});

export interface ListComponentProps<T extends SceneObject = SceneObject> {
    object: T;
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

export const LayerList: React.FunctionComponent<LayerListProps> = ({ headerText, layer, objects, onMove }) => {
    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (result.destination?.droppableId !== dropId(layer)) {
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
                <Droppable droppableId={dropId(layer)}>
                    {(provided) => (
                        <ul className={listClassNames.list} {...provided.droppableProps} ref={provided.innerRef}>
                            {objects.map((object, key) => (
                                <ListItem object={object} key={key} index={key} layer={layer} />
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
    object: SceneObject;
    layer: EditList;
}

const ListItem: React.FunctionComponent<ListItemProps> = ({ index, object, layer }) => {
    const [selection, setSelection] = useSelection();
    const isSelected = layer === selection?.layer && index === selection.index;

    const onClick = useCallback(() => {
        setSelection({ layer, index });
    }, [index, layer, setSelection]);

    const theme = useTheme();
    const classNames = getListItemClassNames(
        () => ({
            root: {
                minHeight: 32,
                margin: '0 -2px',
                padding: 2,
                display: 'flex',
                flexFlow: 'row',
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
        <Draggable draggableId={index.toString()} index={index}>
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
                        <Component object={object} isSelected={isSelected} />
                    </li>
                );
            }}
        </Draggable>
    );
};
