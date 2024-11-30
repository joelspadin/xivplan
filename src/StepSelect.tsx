import {
    DndContext,
    DragEndEvent,
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
    ButtonProps,
    Dialog,
    DialogActions,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    SelectTabData,
    SelectTabEvent,
    Tab,
    TabList,
    Tooltip,
    makeStyles,
    mergeClasses,
    tokens,
    typographyStyles,
} from '@fluentui/react-components';
import { AddFilled, ArrowSwapRegular, DeleteFilled, DeleteRegular, bundleIcon } from '@fluentui/react-icons';
import React, { HTMLAttributes, useCallback, useMemo, useState } from 'react';
import { HotkeyBlockingDialogBody } from './HotkeyBlockingDialogBody';
import { useScene } from './SceneProvider';
import { ScenePreview } from './render/SceneRenderer';
import { Scene } from './scene';

export const StepSelect: React.FC = () => {
    const classes = useStyles();
    const { scene, stepIndex, dispatch } = useScene();
    const steps = useMemo(() => scene.steps.map((_, i) => i), [scene.steps]);

    const handleTabSelect = useCallback(
        (event: SelectTabEvent, data: SelectTabData) => {
            const index = data.value as number;
            dispatch({ type: 'setStep', index });
        },
        [dispatch],
    );

    const maxWidth = useMemo(() => {
        return scene.arena.width + scene.arena.padding * 2;
    }, [scene]);

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

function getStepText(index: number) {
    return (index + 1).toString();
}

interface StepButtonProps {
    index: number;
}

const StepButton: React.FC<StepButtonProps> = ({ index }) => {
    const classes = useStyles();
    const stepText = getStepText(index);

    return (
        <Tooltip content={`Step ${stepText}`} relationship="label" withArrow>
            <Tab value={index}>
                <div className={classes.tab}>{stepText}</div>
            </Tab>
        </Tooltip>
    );
};

const AddStepButton: React.FC<ButtonProps> = (props) => {
    const { dispatch } = useScene();

    return (
        <Tooltip content="Add new step" relationship="label" withArrow>
            <Button icon={<AddFilled />} appearance="subtle" onClick={() => dispatch({ type: 'addStep' })} {...props} />
        </Tooltip>
    );
};

const DeleteIcon = bundleIcon(DeleteFilled, DeleteRegular);

const RemoveStepButton: React.FC = () => {
    const { scene, stepIndex, dispatch } = useScene();
    const stepText = getStepText(stepIndex);

    return (
        <Tooltip content={`Delete step ${stepText}`} relationship="label" withArrow>
            <Button
                icon={<DeleteIcon />}
                appearance="subtle"
                disabled={scene.steps.length < 2}
                onClick={() => dispatch({ type: 'removeStep', index: stepIndex })}
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

    const applyOrder = useCallback(() => {
        dispatch({ type: 'reoderSteps', order: order.map((x) => x.index) });
    }, [order, dispatch]);

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

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;

            if (!over || active.id === over.id) {
                return;
            }

            const oldIndex = order.findIndex((x) => x.id === active.id);
            const newIndex = order.findIndex((x) => x.id === over.id);
            const newOrder = arrayMove(order, oldIndex, newIndex);

            onOrderChange(newOrder);
        },
        [order, onOrderChange],
    );

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

interface StepItemProps extends HTMLAttributes<HTMLDivElement> {
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

const StepItem = React.forwardRef<HTMLDivElement, StepItemProps>(({ scene, step, className, ...props }, ref) => {
    const classes = useStyles();
    const stepText = `Step ${getStepText(step.index)}`;

    return (
        <div ref={ref} className={mergeClasses(classes.stepItem, className)} {...props}>
            <div className={classes.stepHeader}>{stepText}</div>
            <ScenePreview scene={scene} stepIndex={step.index} width={PREVIEW_SIZE} height={PREVIEW_SIZE} simple />
        </div>
    );
});
StepItem.displayName = 'StepItem';

const useStyles = makeStyles({
    root: {
        gridArea: 'steps',
        display: 'flex',
        flexFlow: 'row',
        columnGap: tokens.spacingHorizontalXS,
        backgroundColor: tokens.colorNeutralBackground2,
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
