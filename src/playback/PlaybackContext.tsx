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
    useMemo,
    useRef,
    useState,
} from 'react';
import { Scene, SceneObject, SceneStep } from '../scene';
import { interpolateStep } from './interpolate';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlaybackState {
    /** Whether the timeline is auto-advancing (playing). */
    isPlaying: boolean;
    /** Current fractional timeline position. 0 = first step; steps.length-1 = last step. */
    playbackTime: number;
    /** Auto-advance speed in steps per second. */
    speed: number;
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

/**
 * Stable callbacks and refs that never change identity during the provider's lifetime.
 * Subscribe to this instead of PlaybackContext when you only need to dispatch actions
 * (and don't want to re-render on every playbackTime/isPlaying change).
 */
export interface PlaybackDispatchValue {
    setPlaybackTime: (t: number) => void;
    togglePlay: () => void;
    setSpeed: (speed: number) => void;
    updateMaxStep: (maxStep: number) => void;
    /** Always-current isPlaying flag. Read in event handlers; do NOT use as a render dep. */
    isPlayingRef: React.RefObject<boolean>;
    /** Always-current playbackTime. Read in event handlers; do NOT use as a render dep. */
    playbackTimeRef: React.RefObject<number>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PlaybackContext = createContext<PlaybackContextValue | null>(null);
const PlaybackDispatchContext = createContext<PlaybackDispatchValue | null>(null);

/**
 * Separate context for pulse time so that the 60fps pulse ticker does not
 * cause all usePlayback() consumers to re-render. Only components that
 * actually need per-frame pulse animation subscribe to this context.
 */
const PulseTimeContext = createContext<number>(0);

export const PlaybackProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTime, setPlaybackTimeState] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [pulseTime, setPulseTime] = useState(0);

    const maxStepRef = useRef(0);
    const lastTimeRef = useRef<number | null>(null);
    // Always-current refs exposed via PlaybackDispatchContext for lazy reads in handlers.
    const isPlayingRef = useRef(isPlaying);
    isPlayingRef.current = isPlaying;
    const playbackTimeRef = useRef(playbackTime);
    playbackTimeRef.current = playbackTime;

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

    // Memoize so consumers only re-render when actual state changes,
    // not when pulseTime ticks (which causes PlaybackProvider itself to re-render at 60fps).
    const value = useMemo<PlaybackContextValue>(
        () => ({ state: { isPlaying, playbackTime, speed }, setPlaybackTime, togglePlay, setSpeed, updateMaxStep }),
        [isPlaying, playbackTime, speed, setPlaybackTime, togglePlay, setSpeed, updateMaxStep],
    );

    // Stable dispatch context — identity never changes after mount.
    // Components that only need callbacks (no state subscription) should use this.
    const dispatchValue = useMemo<PlaybackDispatchValue>(
        () => ({ setPlaybackTime, togglePlay, setSpeed, updateMaxStep, isPlayingRef, playbackTimeRef }),
        // Callbacks are stable (useCallback). Refs are stable objects (useRef). Safe to omit from deps.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [setPlaybackTime, togglePlay, setSpeed, updateMaxStep],
    );

    return (
        <PlaybackDispatchContext value={dispatchValue}>
            <PulseTimeContext value={pulseTime}>
                <PlaybackContext value={value}>{children}</PlaybackContext>
            </PulseTimeContext>
        </PlaybackDispatchContext>
    );
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
        state: { isPlaying: false, playbackTime, speed: 1 },
        setPlaybackTime: () => {},
        togglePlay: () => {},
        setSpeed: () => {},
        updateMaxStep: () => {},
    };
    return (
        <PulseTimeContext value={pulseTime}>
            <PlaybackContext value={value}>{children}</PlaybackContext>
        </PulseTimeContext>
    );
};

/** Returns playback context, or null when used outside <PlaybackProvider>. */
export function useOptionalPlayback(): PlaybackContextValue | null {
    return useContext(PlaybackContext);
}

/**
 * Returns the current pulse time in seconds (mod 1000), updated at ~60fps.
 * Only subscribe to this when you actually need per-frame pulse animation —
 * it causes re-renders at browser framerate.
 */
export function usePulseTime(): number {
    return useContext(PulseTimeContext);
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
 * Returns stable dispatch callbacks + refs without subscribing to state changes.
 * Use this in components that only call setPlaybackTime/togglePlay and should NOT
 * re-render when playbackTime advances during playback.
 */
export function usePlaybackDispatch(): PlaybackDispatchValue {
    const ctx = useContext(PlaybackDispatchContext);
    if (!ctx) throw new Error('usePlaybackDispatch must be used inside <PlaybackProvider>');
    return ctx;
}

/** Returns stable dispatch context, or null when outside <PlaybackProvider>. */
export function useOptionalPlaybackDispatch(): PlaybackDispatchValue | null {
    return useContext(PlaybackDispatchContext);
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
// ─── Main hook ────────────────────────────────────────────────────────────────

/**
 * Returns the object list to display at the current playback position.
 *
 * Pulse animation (opacity oscillation, blink, scale, glow) is intentionally
 * NOT applied here. It is handled per-object in ObjectRenderer via PulsingObjectGroup,
 * which subscribes to PulseTimeContext independently. This prevents SceneContents from
 * re-rendering at 60fps just because the pulse ticker ticked.
 */
export function useDisplayObjects(scene: Scene, editModeObjects: readonly SceneObject[]): readonly SceneObject[] {
    const playback = useOptionalPlayback();

    if (!playback) {
        return editModeObjects;
    }

    const { playbackTime } = playback.state;
    const maxStep = scene.steps.length - 1;

    const floorIdx = Math.min(Math.floor(playbackTime), maxStep);
    const ceilIdx = Math.min(Math.ceil(playbackTime), maxStep);
    const frac = playbackTime - floorIdx;

    if (frac === 0 || floorIdx === ceilIdx) {
        return scene.steps[floorIdx]?.objects ?? editModeObjects;
    }

    const stepA: SceneStep = scene.steps[floorIdx] ?? { objects: [] };
    const stepB: SceneStep = scene.steps[ceilIdx] ?? { objects: [] };
    const stepPrev = scene.steps[floorIdx - 1] ?? null;
    const stepNext = scene.steps[ceilIdx + 1] ?? null;

    return interpolateStep(stepA, stepB, frac, stepPrev, stepNext);
}
