/**
 * Core interpolation engine for xivplan playback mode.
 *
 * Given two adjacent SceneSteps and a fractional t (0–1), produces an
 * interpolated array of SceneObjects that smoothly blends between them.
 *
 * Matching strategy:
 *   - Objects with matching `trackId` across steps are lerped using ABSOLUTE
 *     coordinates, so position-parent (positionParentId) and facing (facingId)
 *     chains are resolved per-step before lerping. The result carries no
 *     positionParentId/facingId so the renderer uses the pre-computed values.
 *   - Objects without a trackId match use their `animation` settings to control
 *     visibility during the transition (default: fade with easeInCirc/easeOutCirc,
 *     starting/ending at the midpoint of the transition).
 */

import {
    AnimationProps,
    BaseObject,
    EasingStyle,
    SceneObject,
    SceneStep,
    isExaflareZone,
    isLineZone,
    isMoveable,
    isRadiusObject,
    isResizable,
    isRotateable,
    supportsHollow,
} from '../scene';
import { getAbsolutePositionInStep, getAbsoluteRotationInStep } from '../coord';

// ─── Math helpers ─────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/** Shortest-path angle lerp (handles 0°/360° wrap-around). */
function lerpAngle(a: number, b: number, t: number): number {
    const delta = ((((b - a) % 360) + 540) % 360) - 180;
    return a + delta * t;
}

/**
 * Uniform Catmull-Rom spline: interpolate between P1 and P2 at t ∈ [0,1]
 * using P0 (previous) and P3 (next) to define smooth tangents.
 * Endpoint clamping: pass P0=P1 when there is no previous point, P3=P2 when
 * there is no next point — this produces a zero tangent and blends gracefully
 * back to linear at the ends of the timeline.
 */
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
        2 * p1 +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
}

// ─── Easing ───────────────────────────────────────────────────────────────────

/** Map a normalised t (0–1) through an easing curve. */
function applyEasing(style: EasingStyle | undefined, t: number): number {
    const s = style ?? 'instant';
    switch (s) {
        case 'linear':
            return t;
        case 'easeIn':
            return t * t;
        case 'easeOut':
            return 1 - (1 - t) * (1 - t);
        case 'easeInOut':
            return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
        case 'easeInCirc':
            return 1 - Math.sqrt(Math.max(0, 1 - t * t));
        case 'easeOutCirc':
            return Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t)));
        case 'instant':
            // Step function: 0 until any progress, then immediately 1.
            // In the enter window this means "fully visible as soon as enterStart passes".
            // In the exit window this means "visible through the whole window — handled in transitionAlpha".
            return t > 0 ? 1 : 0;
        default:
            return t;
    }
}

// ─── Object lerp ──────────────────────────────────────────────────────────────

/**
 * Interpolate all numeric spatial/visual properties between two SceneObjects.
 *
 * Position and rotation are resolved to ABSOLUTE values using each step's own
 * object graph before lerping, so positionParentId / facingId mismatches across
 * steps produce correct world-space motion instead of teleporting artefacts.
 *
 * Non-numeric properties (type, color, image, etc.) come from `b`.
 * The `id` is kept from `a` so Konva reuses the same canvas node throughout.
 */
export function lerpObject(
    a: SceneObject,
    b: SceneObject,
    t: number,
    stepA: SceneStep,
    stepB: SceneStep,
): SceneObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = { ...b, id: a.id };

    // Apply easing to t so all property lerps respect the animation curve.
    // Use b's enterEase (the "incoming" state's easing); fall back to linear.
    const enterEase = (b as BaseObject).animation?.enterEase ?? 'linear';
    const et = applyEasing(enterEase, t);

    // Opacity (0–100 in xivplan)
    result.opacity = lerp(a.opacity, b.opacity, et);

    // Position — resolve absolute coordinates per-step to handle positionParentId correctly.
    // The result uses absolute coords (no positionParentId) so the renderer doesn't re-apply
    // a parent offset that belongs to a different step.
    if (isMoveable(a) && isMoveable(b)) {
        const posA = getAbsolutePositionInStep(stepA, a);
        const posB = getAbsolutePositionInStep(stepB, b);
        result.x = lerp(posA.x, posB.x, et);
        result.y = lerp(posA.y, posB.y, et);
        result.positionParentId = undefined;
    }

    // Rotation — resolve absolute rotation per-step to handle facingId correctly.
    if (isRotateable(a) && isMoveable(a) && isRotateable(b) && isMoveable(b)) {
        const rotA = getAbsoluteRotationInStep(stepA, a);
        const rotB = getAbsoluteRotationInStep(stepB, b);
        result.rotation = lerpAngle(rotA, rotB, et);
        result.facingId = undefined;
    }

    // Radius
    if (isRadiusObject(a) && isRadiusObject(b)) {
        result.radius = lerp(a.radius, b.radius, et);
    }

    // Width + height
    if (isResizable(a) && isResizable(b)) {
        result.width = lerp(a.width, b.width, et);
        result.height = lerp(a.height, b.height, et);
    }

    // Line-specific props
    if (isLineZone(a) && isLineZone(b)) {
        result.length = lerp(a.length, b.length, et);
        result.width = lerp(a.width, b.width, et);
    }

    // Exaflare-specific
    if (isExaflareZone(a) && isExaflareZone(b)) {
        result.length = lerp(a.length, b.length, et);
    }

    // Hollow — interpolate fill alpha between solid (0) and hollow (1)
    if (supportsHollow(a) && supportsHollow(b)) {
        const aH = typeof a.hollow === 'number' ? a.hollow : (a.hollow ? 1 : 0);
        const bH = typeof b.hollow === 'number' ? b.hollow : (b.hollow ? 1 : 0);
        result.hollow = lerp(aH, bH, et);
    }

    return result as SceneObject;
}

// ─── Transition alpha ─────────────────────────────────────────────────────────

/**
 * Compute a 0–1 opacity multiplier for an unmatched object's fade during transition.
 *
 * Default behaviour:
 *   - enter: instant, starting at t = 0.5 (second half of the transition)
 *   - exit:  instant, ending   at t = 0.5 (first half of the transition)
 *
 * This keeps objects fully visible for most of the step and only transitions
 * at the edges, avoiding the "everything fades at once" look.
 */
/**
 * Compute a 0–1 opacity multiplier for an unmatched object's fade during transition.
 *
 * Easing and timing are fully controlled by `animation.enterEase/enterStart` and
 * `animation.exitEase/exitEnd`. Use `'instant'` easing for a hard pop-in/pop-out.
 *
 * Defaults:
 *   - enter: instant starting at t = 0.5  →  object fades in during the second half
 *   - exit:  instant ending   at t = 0.5  →  object fades out during the first half
 */
function transitionAlpha(animation: AnimationProps | undefined, t: number, isExit: boolean): number {
    if (isExit) {
        // exitEnd: fraction [0–1] at which the object becomes invisible. Default 0.5.
        const exitEnd = animation?.exitEnd ?? 0.5;
        if (exitEnd <= 0) return 0;
        if (t >= exitEnd) return 0;
        const ease = animation?.exitEase ?? 'instant';
        // instant: fully visible throughout the exit window, then snaps to 0 at exitEnd
        if (ease === 'instant') return 1;
        const norm = t / exitEnd; // 0→1 across the exit window
        return 1 - applyEasing(ease, norm);
    } else {
        // enterStart: fraction [0–1] at which the object starts appearing. Default 0.5.
        const enterStart = animation?.enterStart ?? 0.5;
        if (enterStart >= 1) return 0;
        // Strict < so that at t == enterStart the entering object is already visible.
        // This ensures exit (t >= exitEnd) and enter (t >= enterStart) hand off cleanly
        // at the same boundary without a frame where both are hidden.
        if (t < enterStart) return 0;
        const ease = animation?.enterEase ?? 'instant';
        // instant: fully visible as soon as enterStart is passed
        if (ease === 'instant') return 1;
        const norm = (t - enterStart) / (1 - enterStart); // 0→1 across the enter window
        return applyEasing(ease, norm);
    }
}

function applyAlpha(obj: SceneObject, alpha: number): SceneObject {
    if (alpha >= 1) return obj;
    return { ...obj, opacity: obj.opacity * alpha } as SceneObject;
}

/**
 * Resolve absolute position for an untracked fading object, optionally following
 * a tracked parent that is being lerped in this transition.
 *
 * - Resolves the full positionParentId chain within `step` to get the object's
 *   absolute position (so the rendered position is correct regardless of which
 *   step the renderer is currently on).
 * - If the direct positionParent is a tracked object that has been lerped (present
 *   in `lerpedMap`), applies the parent's movement delta so the child follows along.
 */
function resolveUntrackedPosition(
    step: SceneStep,
    obj: SceneObject,
    lerpedMap: Map<number, SceneObject>,
): { x: number; y: number } | null {
    if (!isMoveable(obj)) return null;

    const absPos = getAbsolutePositionInStep(step, obj);

    const parentId = obj.positionParentId;
    if (parentId === undefined) return absPos;

    const lerpedParent = lerpedMap.get(parentId);
    if (!lerpedParent || !isMoveable(lerpedParent)) return absPos;

    // Parent is tracked — compute how far it has moved from its step-local position.
    const stepParent = step.objects.find((o) => (o as BaseObject).id === parentId);
    if (!stepParent || !isMoveable(stepParent)) return absPos;

    const parentStepAbs = getAbsolutePositionInStep(step, stepParent);
    return {
        x: absPos.x + (lerpedParent.x - parentStepAbs.x),
        y: absPos.y + (lerpedParent.y - parentStepAbs.y),
    };
}

// ─── Main interpolation function ──────────────────────────────────────────────

/**
 * Produce the display objects for a point `t` between two steps.
 * @param stepA  The "from" step (integer step floor(playbackTime))
 * @param stepB  The "to"   step (integer step ceil(playbackTime))
 * @param t      Fraction 0–1 between the two steps
 */
export function interpolateStep(
    stepA: SceneStep,
    stepB: SceneStep,
    t: number,
    stepPrev?: SceneStep | null,
    stepNext?: SceneStep | null,
): SceneObject[] {
    const aByTrack = new Map<string, SceneObject>();
    const bByTrack = new Map<string, SceneObject>();

    for (const obj of stepA.objects) {
        if ((obj as BaseObject).trackId) {
            aByTrack.set((obj as BaseObject).trackId!, obj);
        }
    }
    for (const obj of stepB.objects) {
        if ((obj as BaseObject).trackId) {
            bByTrack.set((obj as BaseObject).trackId!, obj);
        }
    }

    const result: SceneObject[] = [];
    const matchedBTrackIds = new Set<string>();

    // Maps from step-local object id → lerped result, used by resolveUntrackedPosition
    // to let fading children follow a moving tracked parent.
    const lerpedByAId = new Map<number, SceneObject>();
    const lerpedByBId = new Map<number, SceneObject>();

    // Linear (pre-CR) positions, keyed by step-A object id.
    // Used in the parent-correction pass so tracked children can receive the same
    // CR delta as their parent instead of following the straight-line interpolation.
    const linearPosByAId = new Map<number, { x: number; y: number }>();

    // ── Pass 1a-i: compute all tracked lerps + CR smoothing ──────────────────
    // Do NOT push to result yet — we need the full lerpedByAId before we can
    // apply parent-correction to children (parent may come after child in the list).
    for (const objA of stepA.objects) {
        const trackId = (objA as BaseObject).trackId;
        if (!trackId || !bByTrack.has(trackId)) continue;

        const objB = bByTrack.get(trackId)!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let lerped: any = lerpObject(objA, objB, t, stepA, stepB);

        // Store the linear (pre-CR) position so the correction pass can compute
        // how far the parent deviated from the straight-line path.
        if (isMoveable(lerped)) {
            linearPosByAId.set((objA as BaseObject).id, { x: lerped.x, y: lerped.y });
        }

        // ── Catmull-Rom position smoothing ──────────────────────────────
        const smoothness = (objB as BaseObject).animation?.smoothness ?? 0;
        if (smoothness > 0 && isMoveable(lerped)) {
            const prevObj = stepPrev?.objects.find((o) => (o as BaseObject).trackId === trackId);
            const nextObj = stepNext?.objects.find((o) => (o as BaseObject).trackId === trackId);

            if (prevObj || nextObj) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const posA = getAbsolutePositionInStep(stepA, objA as any);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const posB = getAbsolutePositionInStep(stepB, objB as any);
                const posP = (prevObj && isMoveable(prevObj))
                    ? getAbsolutePositionInStep(stepPrev!, prevObj)
                    : posA;
                const posN = (nextObj && isMoveable(nextObj))
                    ? getAbsolutePositionInStep(stepNext!, nextObj)
                    : posB;

                const ease = (objB as BaseObject).animation?.enterEase ?? 'linear';
                const et = applyEasing(ease, t);

                const crX = catmullRom(posP.x, posA.x, posB.x, posN.x, et);
                const crY = catmullRom(posP.y, posA.y, posB.y, posN.y, et);

                lerped = {
                    ...lerped,
                    x: lerp(lerped.x, crX, smoothness),
                    y: lerp(lerped.y, crY, smoothness),
                };
            }
        }

        matchedBTrackIds.add(trackId);
        lerpedByAId.set((objA as BaseObject).id, lerped);
        lerpedByBId.set((objB as BaseObject).id, lerped);
    }

    // ── Pass 1a-ii: propagate parent CR delta to tracked children ────────────
    // A tracked child whose positionParentId refers to a tracked parent will have
    // been lerped linearly (absolute coords, straight line) even though the parent
    // is following a curved CR path. Apply the difference so the child stays 1:1.
    for (const objA of stepA.objects) {
        const trackId = (objA as BaseObject).trackId;
        if (!trackId || !bByTrack.has(trackId)) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parentId = (objA as any).positionParentId as number | undefined;
        if (parentId === undefined) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const smoothedParent = lerpedByAId.get(parentId) as any;
        const linearParent = linearPosByAId.get(parentId);
        if (!smoothedParent || !linearParent) continue;

        const dx = smoothedParent.x - linearParent.x;
        const dy = smoothedParent.y - linearParent.y;
        if (dx === 0 && dy === 0) continue;

        const aId = (objA as BaseObject).id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lerped = lerpedByAId.get(aId) as any;
        if (!lerped || !isMoveable(lerped)) continue;

        const corrected = { ...lerped, x: lerped.x + dx, y: lerped.y + dy } as SceneObject;
        lerpedByAId.set(aId, corrected);
        const objB = bByTrack.get(trackId)!;
        lerpedByBId.set((objB as BaseObject).id, corrected);
    }

    // ── Pass 1a-iii: collect tracked results ─────────────────────────────────
    for (const objA of stepA.objects) {
        const trackId = (objA as BaseObject).trackId;
        if (!trackId || !bByTrack.has(trackId)) continue;
        result.push(lerpedByAId.get((objA as BaseObject).id)!);
    }

    // ── Pass 1b: untracked exiting objects — lerpedByAId is now fully populated ──
    for (const objA of stepA.objects) {
        const trackId = (objA as BaseObject).trackId;
        if (trackId && bByTrack.has(trackId)) continue; // already handled

        const alpha = transitionAlpha((objA as BaseObject).animation, t, true);
        if (alpha > 0) {
            const pos = resolveUntrackedPosition(stepA, objA, lerpedByAId);
            const resolved = pos
                ? { ...objA, x: pos.x, y: pos.y, positionParentId: undefined }
                : objA;
            result.push(applyAlpha(resolved as SceneObject, alpha));
        }
    }

    // ── Pass 2: entering objects from step B ──
    for (const objB of stepB.objects) {
        const trackId = (objB as BaseObject).trackId;
        if (trackId && matchedBTrackIds.has(trackId)) continue;

        const alpha = transitionAlpha((objB as BaseObject).animation, t, false);
        if (alpha > 0) {
            const pos = resolveUntrackedPosition(stepB, objB, lerpedByBId);
            const resolved = pos
                ? { ...objB, x: pos.x, y: pos.y, positionParentId: undefined }
                : objB;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result.push({ ...applyAlpha(resolved as SceneObject, alpha), _ceilOnly: true } as any);
        }
    }

    return result;
}
