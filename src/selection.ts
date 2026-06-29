import { use, useMemo } from 'react';
import { CrossStepContext, CrossStepContextValue, SimilarityFilters } from './CrossStepContext';
import { useScene } from './SceneProvider';
import {
    DragSelectionContext,
    SceneSelection,
    SelectionContext,
    SelectionState,
    SpotlightContext,
} from './SelectionContext';
import { isColored, isImageObject, isMoveable, isRadiusObject, isResizable, ObjectType, Scene, SceneObject, SceneStep } from './scene';

/**
 * State for selected objects.
 */
export function useSelection(): SelectionState {
    return use(SelectionContext);
}

/**
 * State for objects that should be highlighted in the scene.
 */
export function useSpotlight(): SelectionState {
    return use(SpotlightContext);
}

/**
 * State for objects currently being dragged.
 */
export function useDragSelection(): SelectionState {
    return use(DragSelectionContext);
}

/**
 * Gets whether the given object is in the drag selection.
 */
export function useIsDragging(object: SceneObject) {
    return useDragSelection()[0].has(object.id);
}

/**
 * Gets the objects in the given step whose IDs are in the given selection.
 */
export function getSelectedObjects(step: SceneStep, selection: SceneSelection): readonly SceneObject[] {
    return step.objects.filter((object) => selection.has(object.id));
}

/**
 * Gets the objects in the given step and selection which should be set as the
 * drag selection when starting a drag operation.
 */
export function getNewDragSelection(step: SceneStep, selection: SceneSelection): SceneSelection {
    return new Set(
        getSelectedObjects(step, selection)
            .filter(isMoveable)
            .map((obj) => obj.id),
    );
}

/**
 * Gets a new selection with only the given ID.
 */
export function selectSingle(id: number): SceneSelection {
    return new Set([id]);
}

/**
 * Gets a new, empty selection.
 */
export function selectNone(): SceneSelection {
    return new Set();
}

/**
 * Gets a new selection which contains all of the given objects.
 */
export function selectAll(objects: readonly SceneObject[]): SceneSelection {
    return new Set(objects.map((object) => object.id));
}

/**
 * Gets a new selection which contains a given number of objects which have yet
 * to be created. Use this when creating new objects in order to make them be
 * selected after they are created.
 */
export function selectNewObjects(scene: Scene, newObjectCount: number): SceneSelection {
    return new Set(Array.from({ length: newObjectCount }).map((_, i) => scene.nextId + i));
}

/**
 * Gets a new selection from the given selection with a new ID added.
 */
export function addSelection(selection: SceneSelection, id: number): SceneSelection {
    return new Set(selection).add(id);
}

/**
 * Gets a new selection from the given selection with an ID removed if it was
 * in the selection.
 */
export function removeSelection(selection: SceneSelection, id: number): SceneSelection {
    const newSelection = new Set(selection);
    newSelection.delete(id);
    return newSelection;
}

/**
 * Gets a new selection from the given selection with an ID added if it was not
 * in the selection or removed if it was.
 */
export function toggleSelection(selection: SceneSelection, id: number): SceneSelection {
    if (selection.has(id)) {
        return removeSelection(selection, id);
    } else {
        return addSelection(selection, id);
    }
}

/**
 * Returns the full cross-step selection context (selection map, mode, tolerance, setters).
 */
export function useCrossStepSelection(): CrossStepContextValue {
    return use(CrossStepContext);
}

/**
 * Returns the objects to edit in the Properties panel.
 * When a cross-step selection is active, returns objects from all selected steps.
 * Otherwise returns the selected objects on the current step.
 */
export function useEditableObjects(): readonly SceneObject[] {
    const { scene, step } = useScene();
    const [selection] = useSelection();
    const { selection: crossStep } = use(CrossStepContext);

    if (crossStep.size > 0) {
        const result: SceneObject[] = [];
        for (const [stepIdx, ids] of crossStep) {
            const s = scene.steps[stepIdx];
            if (s) {
                result.push(...s.objects.filter((o) => ids.has(o.id)));
            }
        }
        return result;
    }

    return getSelectedObjects(step, selection);
}

interface ObjectSimilarityKey {
    type: ObjectType;
    width?: number;
    height?: number;
    radius?: number;
    color?: string;
    image?: string;
    hide?: boolean;
}

function getObjectSimilarityKey(obj: SceneObject): ObjectSimilarityKey {
    return {
        type: obj.type,
        width: isResizable(obj) ? obj.width : undefined,
        height: isResizable(obj) ? obj.height : undefined,
        radius: isRadiusObject(obj) ? obj.radius : undefined,
        color: isColored(obj) ? obj.color : undefined,
        image: isImageObject(obj) ? obj.image : undefined,
        hide: obj.hide ?? false,
    };
}

function getTemplateSimilarityKey(objects: readonly SceneObject[]): ObjectSimilarityKey | null {
    if (!objects.length) return null;
    const first = objects[0]!;
    if (!objects.every((o) => o.type === first.type)) return null;

    const keys = objects.map(getObjectSimilarityKey);
    const firstKey = keys[0]!;

    return {
        type: first.type,
        width: keys.every((k) => k.width === firstKey.width) ? firstKey.width : undefined,
        height: keys.every((k) => k.height === firstKey.height) ? firstKey.height : undefined,
        radius: keys.every((k) => k.radius === firstKey.radius) ? firstKey.radius : undefined,
        color: keys.every((k) => k.color === firstKey.color) ? firstKey.color : undefined,
        image: keys.every((k) => k.image === firstKey.image) ? firstKey.image : undefined,
        hide: keys.every((k) => k.hide === firstKey.hide) ? firstKey.hide : undefined,
    };
}

function matchesSimilarityKey(obj: SceneObject, key: ObjectSimilarityKey): boolean {
    if (obj.type !== key.type) return false;
    const objKey = getObjectSimilarityKey(obj);
    if (key.width !== undefined && objKey.width !== key.width) return false;
    if (key.height !== undefined && objKey.height !== key.height) return false;
    if (key.radius !== undefined && objKey.radius !== key.radius) return false;
    if (key.color !== undefined && objKey.color !== key.color) return false;
    if (key.image !== undefined && objKey.image !== key.image) return false;
    if (key.hide !== undefined && objKey.hide !== key.hide) return false;
    return true;
}

export interface AvailableFilters {
    trackId: boolean;
    properties: boolean;
    position: boolean;
}

/**
 * Returns which filter pills are applicable for the current selection.
 * trackId: any selected object has a trackId.
 * properties: all selected objects share the same type.
 * position: same as properties and at least one selected object is moveable.
 */
export function useAvailableFilters(): AvailableFilters {
    const { step } = useScene();
    const [selection] = useSelection();

    return useMemo(() => {
        const selected = getSelectedObjects(step, selection);
        if (!selected.length) return { trackId: false, properties: false, position: false };

        const firstType = selected[0]!.type;
        const homogeneous = selected.every((o) => o.type === firstType);

        return {
            trackId: selected.some((o) => Boolean(o.trackId)),
            properties: homogeneous,
            position: homogeneous && selected.some(isMoveable),
        };
    }, [step, selection]);
}

/**
 * Finds similar objects across all steps based on the active similarity filters.
 * Returns a map of stepIndex → set of matching objectIds.
 * Returns an empty map when no filters are active or the selection is empty/heterogeneous.
 */
export function useSimilarObjects(
    filters: SimilarityFilters,
    positionTolerance = 0,
): ReadonlyMap<number, ReadonlySet<number>> {
    const { scene, step } = useScene();
    const [selection] = useSelection();
    const { trackId: filterTrackId, properties: filterProperties, position: filterPosition } = filters;

    return useMemo(() => {
        if (!filterTrackId && !filterProperties && !filterPosition) return new Map();

        const selectedObjects = getSelectedObjects(step, selection);
        if (!selectedObjects.length) return new Map();

        const firstType = selectedObjects[0]!.type;
        if (!selectedObjects.every((o) => o.type === firstType)) return new Map();

        const trackIds = filterTrackId
            ? new Set(selectedObjects.map((o) => o.trackId).filter((id): id is string => Boolean(id)))
            : null;
        if (filterTrackId && (!trackIds || !trackIds.size)) return new Map();

        const propKey = filterProperties ? getTemplateSimilarityKey(selectedObjects) : null;
        if (filterProperties && !propKey) return new Map();

        const moveableTemplates = filterPosition ? selectedObjects.filter(isMoveable) : null;

        const result = new Map<number, Set<number>>();

        scene.steps.forEach((s, stepIdx) => {
            const matches = s.objects.filter((o) => {
                if (o.type !== firstType) return false;
                if (trackIds !== null && (!o.trackId || !trackIds.has(o.trackId))) return false;
                if (propKey !== null && !matchesSimilarityKey(o, propKey)) return false;
                if (moveableTemplates !== null) {
                    if (!isMoveable(o)) return false;
                    if (
                        !moveableTemplates.some(
                            (t) =>
                                Math.abs(o.x - t.x) <= positionTolerance &&
                                Math.abs(o.y - t.y) <= positionTolerance,
                        )
                    )
                        return false;
                }
                return true;
            });
            if (matches.length) {
                result.set(stepIdx, new Set(matches.map((m) => m.id)));
            }
        });

        return result;
    }, [scene, step, selection, filterTrackId, filterProperties, filterPosition, positionTolerance]);
}
