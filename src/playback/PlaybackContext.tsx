/**
 * Playback mode context for xivplan.
 *
 * Provides a fractional `playbackTime` (float from 0 to steps.length-1)
 * that drives smooth interpolation between steps in the renderer.
 *
 * Usage:
 *   Wrap the editor root in <PlaybackProvider>.
 *   Call usePlayback() anywhere inside to read/control playback state.
 *   Use useDisplayObjects(scene, editObjects) in the renderer to get the
 *   interpolated object list for the current frame.
 */

/* eslint-disable react-refresh/only-export-components */
import React, {
    PropsWithChildren,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { AnimationProps, Scene, SceneObject, SceneStep } from '../scene';
import { interpolateStep } from './interpolate';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlaybackState {
    /** Whether the timeline is auto-advancing (playing). */
    isPlaying: boolean;
    /** Current fractional timeline position. 0 = first step; steps.length-1 = last step. */
    playbackTime: number;
    /** Auto-advance speed in steps per second. */
    speed: number;
    /**
     * Continuously-advancing wall-clock time in seconds (mod 1000).
     * Updated every animation frame — used by pulse/blink effects.
     */
    pulseTime: number;

}

export interface PlaybackContextValue {
    state: PlaybackState;
    /** Directly set the fractional playback position. */
    setPlaybackTime: (t: number) => void;
    /** Toggle between play and pause. */
    togglePlay: () => void;
    /** Set playback speed (steps per second). */
    setSpeed: (speed: number) => void;
    /** Called by PlaybackTimeline each render to keep the RAF loop aware of the max step. */
    updateMaxStep: (maxStep: number) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export const PlaybackProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTime, setPlaybackTimeState] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [pulseTime, setPulseTime] = useState(0);

    const maxStepRef = useRef(0);
    const lastTimeRef = useRef<number | null>(null);

    // ── Continuous pulse ticker (always running for pulse/blink effects) ──
    useEffect(() => {
        let raf: number;
        const tick = (time: number) => {
            setPulseTime((time / 1000) % 1000);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    const updateMaxStep = useCallback((maxStep: number) => {
        maxStepRef.current = maxStep;
    }, []);

    const setPlaybackTime = useCallback((t: number) => {
        setPlaybackTimeState(Math.max(0, Math.min(maxStepRef.current, t)));
    }, []);

    const togglePlay = useCallback(() => {
        setIsPlaying((prev) => !prev);
    }, []);

    // ── RAF auto-advance loop ──
    useEffect(() => {
        if (!isPlaying) {
            lastTimeRef.current = null;
            return;
        }

        let raf: number;

        const tick = (time: number) => {
            if (lastTimeRef.current !== null) {
                const dt = (time - lastTimeRef.current) / 1000; // ms → seconds
                setPlaybackTimeState((prev) => {
                    const next = prev + speed * dt;
                    if (next >= maxStepRef.current) {
                        setIsPlaying(false);
                        return maxStepRef.current;
                    }
                    return next;
                });
            }
            lastTimeRef.current = time;
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            lastTimeRef.current = null;
        };
    }, [isPlaying, speed]);

    const value: PlaybackContextValue = {
        state: { isPlaying, playbackTime, speed, pulseTime },
        setPlaybackTime,
        togglePlay,
        setSpeed,
        updateMaxStep,
    };

    return <PlaybackContext value={value}>{children}</PlaybackContext>;
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Provides a fixed, non-advancing playback time.
 * Useful for off-screen rendering (e.g. video export) where the caller drives
 * `playbackTime` directly rather than through a RAF loop.
 */
export const StaticPlaybackProvider: React.FC<PropsWithChildren<{ playbackTime: number; pulseTime?: number }>> = ({
    children,
    playbackTime,
    pulseTime = 0,
}) => {
    const value: PlaybackContextValue = {
        state: { isPlaying: false, playbackTime, speed: 1, pulseTime },
        setPlaybackTime: () => {},
        togglePlay: () => {},
        setSpeed: () => {},
        updateMaxStep: () => {},
    };
    return <PlaybackContext value={value}>{children}</PlaybackContext>;
};

/** Returns playback context, or null when used outside <PlaybackProvider>. */
export function useOptionalPlayback(): PlaybackContextValue | null {
    return useContext(PlaybackContext);
}

/** Returns playback context. Must be used inside <PlaybackProvider>. */
export function usePlayback(): PlaybackContextValue {
    const ctx = useContext(PlaybackContext);
    if (!ctx) {
        throw new Error('usePlayback must be used inside <PlaybackProvider>');
    }
    return ctx;
}

/**
 * Returns the object list to display at the current playback position.
 *
 * When playbackTime is fractional (mid-step), returns interpolated objects so that
 * scrubbing the slider while paused also shows the blended view.
 * When playbackTime is exactly an integer (on a step boundary), returns editModeObjects
 * unchanged so the canvas stays fully interactive for editing.
 * Outside PlaybackProvider (e.g. ScenePreview): returns editModeObjects unchanged.
 */
// ─── Pulse / blink effect ─────────────────────────────────────────────────────

function applyPulseToObjects(objects: readonly SceneObject[], pulseTime: number): readonly SceneObject[] {
    return objects.map((obj) => {
        const pulse = (obj as { animation?: AnimationProps }).animation?.pulse ?? 'none';
        if (pulse === 'none') return obj;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = { ...obj };

        if (pulse === 'pulse') {
            // Sine wave opacity: 0.4–1.0, ~1 Hz
            result.opacity = (obj.opacity ?? 100) * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(pulseTime * Math.PI * 2)));
        } else if (pulse === 'blink') {
            // Square wave opacity: fully on/off at ~1.5 Hz
            result.opacity = (obj.opacity ?? 100) * ((pulseTime * 3) % 1 < 0.5 ? 1 : 0);
        } else if (pulse === 'snapshot') {
            // Subtle size pulse (~2.5 Hz, ±3%) — like a camera shutter click
            result._pulseScale = 1 + 0.03 * Math.sin(pulseTime * Math.PI * 5);
        } else if (pulse === 'highlight') {
            // Faint pulsing glow (~1 Hz)
            result._pulseGlow = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(pulseTime * Math.PI * 2));
        }

        return result as SceneObject;
    });
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useDisplayObjects(scene: Scene, editModeObjects: readonly SceneObject[]): readonly SceneObject[] {
    const playback = useOptionalPlayback();

    if (!playback) {
        return editModeObjects;
    }

    const { playbackTime, pulseTime } = playback.state;
    const maxStep = scene.steps.length - 1;

    const floorIdx = Math.min(Math.floor(playbackTime), maxStep);
    const ceilIdx = Math.min(Math.ceil(playbackTime), maxStep);
    const frac = playbackTime - floorIdx;

    // On an exact step boundary: show that step's objects.
    // Use scene.steps[floorIdx] directly so the display follows playbackTime,
    // not stepIndex (they can differ — e.g. animation ends at step 3 while stepIndex is still 0).
    if (frac === 0 || floorIdx === ceilIdx) {
        const baseObjects = scene.steps[floorIdx]?.objects ?? editModeObjects;
        return applyPulseToObjects(baseObjects, pulseTime);
    }

    const stepA: SceneStep = scene.steps[floorIdx] ?? { objects: [] };
    const stepB: SceneStep = scene.steps[ceilIdx] ?? { objects: [] };
    const stepPrev = scene.steps[floorIdx - 1] ?? null;
    const stepNext = scene.steps[ceilIdx + 1] ?? null;

    const interpolated = interpolateStep(stepA, stepB, frac, stepPrev, stepNext);
    return applyPulseToObjects(interpolated, pulseTime);
}
