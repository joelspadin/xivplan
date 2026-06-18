import {
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Button,
    type ButtonProps,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    type SelectTabData,
    type SelectTabEvent,
    Tab,
    TabList,
    Tooltip,
    makeStyles,
    mergeClasses,
    shorthands,
    tokens,
    typographyStyles,
} from '@fluentui/react-components';
import { AddFilled, ArrowSwapRegular, DeleteFilled, DeleteRegular, bundleIcon } from '@fluentui/react-icons';
import React, { type HTMLAttributes, type RefAttributes, useState } from 'react';
import { HotkeyBlockingDialogBody } from './HotkeyBlockingDialogBody';
import { getObjectById, useScene } from './SceneProvider';
import { ScenePreview } from './render/SceneRenderer';
import { type Scene, getStepDisplayString, isMoveable } from './scene';
import { useSelection, useSpotlight } from './selection';
import { MIN_STAGE_WIDTH, SPOTLIGHT_COLOR, SPOTLIGHT_DARK_SHADOW_COLOR } from './theme';
import { useCancelConnectionSelection } from './useEditMode';

export const StepSelect: React.FC = () => {
    const classes = useStyles();
    const { scene, stepIndex, dispatch } = useScene();
    const steps = scene.steps.map((_, i) => i);

    const handleTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
        const index = data.value as number;
        dispatch({ type: 'setStep', index });
    };

    const maxWidth = scene.arena.width + scene.arena.padding * 2;

    return (
        <div className={classes.root} style={{ maxWidth }}>
            <div className={classes.listWrapper}>
                <TabList
                    size="small"
                    appearance="subtle"
                    className={classes.tabList}
                    selectedValue={stepIndex}
                    onTabSelect={handleTabSelect}
                >
                    {steps.map((i) => (
                        <StepButton key={i} index={i} />
                    ))}
                </TabList>
            </div>
            <div className={classes.actions}>
                <AddStepButton className={classes.addButton} />
                <ReorderStepsButton />
                <RemoveStepButton />
            </div>
        </div>
    );
};

const PREVIEW_SIZE = 180;

interface StepButtonProps {
    index: number;
}

/**
 * Determines the border styling for step tab buttons based on the current
 * selection and spotlight.
 *
 * If the step contains the current selection, selection styling is applied.
 * If the step contains the current spotlight object and is _not_ the current
 * step, spotlight styling is applied. Otherwise, if the step contains objects
 * connected to the current selection, connection styling is applied.
 */
function useStepButtonHighlightClass(stepIndexOfButton: number): string | undefined {
    const [selection] = useSelection();
    const [spotlight] = useSpotlight();
    const { scene, stepIndex } = useScene();
    const classes = useStyles();

    let hasObjectConnectedToSelection = false;
    let hasSpotlightObject = false;
    for (const obj of scene.steps[stepIndexOfButton]!.objects) {
        if (selection.has(obj.id)) {
            // Selection styling always takes precendence. The other two cases
            // can only be resolved after going through all objects in the step.
            return classes.tabWithSelection;
        }
        if (spotlight.has(obj.id)) {
            hasSpotlightObject = true;
        }
        let parentId = isMoveable(obj) ? obj.positionParentId : undefined;
        while (parentId !== undefined) {
            if (selection.has(parentId)) {
                hasObjectConnectedToSelection = true;
                break;
            }
            const parent = getObjectById(scene, parentId);
            parentId = isMoveable(parent) ? parent.positionParentId : undefined;
        }
    }
    if (stepIndexOfButton != stepIndex && hasSpotlightObject) {
        return classes.tabWithSpotlight;
    }
    if (hasObjectConnectedToSelection) {
        return classes.tabWithSelectionConnections;
    }
}

const StepButton: React.FC<StepButtonProps> = ({ index }) => {
    const classes = useStyles();
    const highlightClass = useStepButtonHighlightClass(index);
    const stepText = getStepDisplayString(index);

    return (
        <Tooltip content={`Step ${stepText}`} relationship="label" withArrow>
            <Tab value={index}>
                <div className={mergeClasses(classes.tab, highlightClass)}>{stepText}</div>
            </Tab>
        </Tooltip>
    );
};

const AddStepButton: React.FC<ButtonProps> = (props) => {
    const { dispatch } = useScene();
    const cancelConnectionSelection = useCancelConnectionSelection();

    const handleAddStep = () => {
        cancelConnectionSelection();
        dispatch({ type: 'addStep' });
    };

    return (
        <Tooltip content="Add new step" relationship="label" withArrow>
            <Button icon={<AddFilled />} appearance="subtle" onClick={handleAddStep} {...props} />
        </Tooltip>
    );
};

const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular);

const RemoveStepButton: React.FC = () => {
    const { scene, stepIndex, dispatch } = useScene();
    const cancelConnectionSelection = useCancelConnectionSelection();
    const stepText = getStepDisplayString(stepIndex);

    const handleDeleteStep = () => {
        cancelConnectionSelection();
        dispatch({ type: 'removeStep', index: stepIndex });
    };

    return (
        <Tooltip content={`Delete step ${stepText}`} relationship="label" withArrow>
            <Button
                icon={<DeleteIcon />}
                appearance="subtle"
                disabled={scene.steps.length < 2}
                onClick={handleDeleteStep}
            />
        </Tooltip>
    );
};

const ReorderStepsButton: React.FC = () => {
    const classes = useStyles();
    const { scene } = useScene();

    return (
        <Dialog>
            <DialogTrigger>
                <Tooltip content="Reorder steps" relationship="label" withArrow>
                    <Button icon={<ArrowSwapRegular />} disabled={scene.steps.length < 2} appearance="subtle" />
                </Tooltip>
            </DialogTrigger>
            <DialogSurface className={classes.dialogSurface}>
                <HotkeyBlockingDialogBody>
                    <ReoderStepsDialogContent />
                </HotkeyBlockingDialogBody>
            </DialogSurface>
        </Dialog>
    );
};

const ReoderStepsDialogContent: React.FC = () => {
    const classes = useStyles();
    const { scene, dispatch } = useScene();
    const [sceneSnapshot] = useState<Scene>(scene);
    const [order, setOrder] = useState<StepOrderItem[]>(scene.steps.map((_, i) => getStepOrderItem(i)));

    const applyOrder = () => {
        dispatch({ type: 'reoderSteps', order: order.map((x) => x.index) });
    };

    return (
        <>
            <DialogTitle>Reorder steps</DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <div>
                    Drag and drop to reorder steps, then click <strong>Apply</strong> to save your changes.
                </div>

                <ReorderStepsList scene={sceneSnapshot} order={order} onOrderChange={setOrder} />
            </DialogContent>
            <DialogActions>
                <DialogTrigger>
                    <Button appearance="primary" onClick={applyOrder}>
                        Apply
                    </Button>
                </DialogTrigger>
                <DialogTrigger>
                    <Button>Cancel</Button>
                </DialogTrigger>
            </DialogActions>
        </>
    );
};

interface StepOrderItem {
    id: string;
    index: number;
}

function getStepOrderItem(index: number | string): StepOrderItem {
    if (typeof index === 'string') {
        index = parseInt(index);
    }

    return {
        id: index.toString(),
        index,
    };
}

interface ReorderStepsListProps {
    scene: Scene;
    order: StepOrderItem[];
    onOrderChange: (order: StepOrderItem[]) => void;
}

const ReorderStepsList: React.FC<ReorderStepsListProps> = ({ scene, order, onOrderChange }) => {
    const classes = useStyles();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = order.findIndex((x) => x.id === active.id);
        const newIndex = order.findIndex((x) => x.id === over.id);
        const newOrder = arrayMove(order, oldIndex, newIndex);

        onOrderChange(newOrder);
    };

    return (
        <div className={classes.dialogList}>
            <DndContext
                sensors={sensors}
                modifiers={[restrictToParentElement]}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={order}>
                    {order.map((step) => (
                        <ReorderableStepItem key={step.id} scene={scene} step={step} />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};

interface StepItemProps extends HTMLAttributes<HTMLDivElement>, RefAttributes<HTMLDivElement> {
    scene: Scene;
    step: StepOrderItem;
}

const ReorderableStepItem: React.FC<StepItemProps> = ({ scene, step }) => {
    const classes = useStyles();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: step.id,
    });

    return (
        <StepItem
            ref={setNodeRef}
            scene={scene}
            step={step}
            className={mergeClasses(isDragging && classes.dragging)}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            {...listeners}
            {...attributes}
        />
    );
};

const StepItem: React.FC<StepItemProps> = ({ ref, scene, step, className, ...props }) => {
    const classes = useStyles();
    const stepText = `Step ${getStepDisplayString(step.index)}`;

    return (
        <div ref={ref} className={mergeClasses(classes.stepItem, className)} {...props}>
            <div className={classes.stepHeader}>{stepText}</div>
            <ScenePreview
                scene={scene}
                stepIndex={step.index}
                width={PREVIEW_SIZE}
                height={PREVIEW_SIZE}
                backgroundColor="transparent"
                simple
            />
        </div>
    );
};

const useStyles = makeStyles({
    root: {
        gridArea: 'steps',
        display: 'flex',
        flexFlow: 'row',
        columnGap: tokens.spacingHorizontalXS,
        backgroundColor: tokens.colorNeutralBackground2,
        minWidth: MIN_STAGE_WIDTH,
    },
    listWrapper: {
        overflow: 'auto',
        padding: '4px 0 4px 4px',
    },
    actions: {
        display: 'flex',
        columnGap: tokens.spacingHorizontalXS,
        marginTop: '4px',
        height: '32px',
        flexShrink: 0,
        flexGrow: 1,
    },
    addButton: {
        marginRight: 'auto',
    },
    tabList: {
        flexWrap: 'wrap',
    },
    tab: {
        minWidth: '16px',
        border: '1px solid transparent',
    },
    tabWithSelection: {
        border: '1px solid',
        borderRadius: '3px',
    },
    tabWithSelectionConnections: {
        border: '1px solid',
        ...shorthands.borderStyle('dashed'),
        borderRadius: '3px',
    },
    tabWithSpotlight: {
        border: '1px solid ' + SPOTLIGHT_COLOR,
        boxShadow: '0px 0px 3px ' + SPOTLIGHT_DARK_SHADOW_COLOR,
        borderRadius: '3px',
    },

    dialogSurface: {
        maxWidth: 'calc(min(1050px, 100% - 50px))',
    },

    dialogContent: {
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalS,
        paddingBottom: tokens.spacingVerticalS,
    },

    dialogList: {
        display: 'flex',
        flexFlow: 'row wrap',
        maxHeight: '80vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        scrollbarGutter: 'stable',
        padding: tokens.spacingHorizontalM,
        columnGap: tokens.spacingHorizontalM,
        rowGap: tokens.spacingVerticalL,
        background: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusLarge,
    },

    stepItem: {
        display: 'flex',
        flexFlow: 'column',

        width: `${PREVIEW_SIZE + 2}px`,
        listStyle: 'none',
        boxSizing: 'border-box',
        border: `${tokens.strokeWidthThin} solid transparent`,
        borderRadius: tokens.borderRadiusLarge,

        transitionProperty: 'background, border, color',
        transitionDuration: tokens.durationFaster,
        transitionTimingFunction: tokens.curveEasyEase,

        ':hover': {
            backgroundColor: tokens.colorSubtleBackgroundHover,
        },
        ':hover:active': {
            backgroundColor: tokens.colorSubtleBackgroundPressed,
        },
    },

    stepHeader: {
        textAlign: 'center',
        marginTop: tokens.spacingVerticalS,
        marginBottom: '-10px',
        paddingInlineStart: tokens.spacingHorizontalS,
        paddingInlineEnd: tokens.spacingHorizontalS,
        ...typographyStyles.body2,
    },

    dragging: {
        zIndex: 1,
        backgroundColor: tokens.colorSubtleBackgroundPressed,
    },
});
