import { Checkbox, Field, Label, Select, Slider, SliderOnChangeData, makeStyles, tokens } from '@fluentui/react-components';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useScene } from '../../SceneProvider';
import { AnimationProps, EasingStyle, PulseStyle, SceneObject } from '../../scene';
import { commonValue } from '../../util';
import { useOptionalPlayback } from '../../playback/PlaybackContext';
import { PropertiesControlProps } from '../PropertiesControl';

// ─── Easing options ───────────────────────────────────────────────────────────

const EASING_OPTIONS: { value: EasingStyle; label: string }[] = [
    { value: 'instant',    label: 'Instant'    },
    { value: 'linear',     label: 'Linear'     },
    { value: 'easeIn',     label: 'Ease In'    },
    { value: 'easeOut',    label: 'Ease Out'   },
    { value: 'easeInOut',  label: 'Ease In-Out'},
    { value: 'easeInCirc', label: 'Circ In'    },
    { value: 'easeOutCirc',label: 'Circ Out'   },
];

const PULSE_OPTIONS: { value: PulseStyle; label: string }[] = [
    { value: 'none',      label: 'None'      },
    { value: 'pulse',     label: 'Pulse'     },
    { value: 'blink',     label: 'Blink'     },
    { value: 'snapshot',  label: 'Snapshot'  },
    { value: 'highlight', label: 'Highlight' },
];

// ─── Easing math (mirrored from interpolate.ts) ───────────────────────────────

function sampleEasing(style: EasingStyle, t: number): number {
    switch (style) {
        case 'instant':     return t > 0 ? 1 : 0;
        case 'linear':      return t;
        case 'easeIn':      return t * t;
        case 'easeOut':     return 1 - (1 - t) * (1 - t);
        case 'easeInOut':   return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
        case 'easeInCirc':  return 1 - Math.sqrt(Math.max(0, 1 - t * t));
        case 'easeOutCirc': return Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t)));
        default:            return t;
    }
}

/** Opacity of the exiting object at time t (0→1 across the transition). */
function exitOpacity(exitEase: EasingStyle, exitEnd: number, t: number): number {
    if (exitEnd <= 0 || t >= exitEnd) return 0;
    if (exitEase === 'instant') return 1;
    return 1 - sampleEasing(exitEase, t / exitEnd);
}

/** Opacity of the entering object at time t (0→1 across the transition). */
function enterOpacity(enterEase: EasingStyle, enterStart: number, t: number): number {
    if (enterStart >= 1 || t < enterStart) return 0;
    if (enterEase === 'instant') return 1;
    return sampleEasing(enterEase, (t - enterStart) / (1 - enterStart));
}

// ─── Combined curve SVG ───────────────────────────────────────────────────────

interface CombinedCurveProps {
    enterEase: EasingStyle;
    exitEase: EasingStyle;
    enterStart: number;
    exitEnd: number;
}

/**
 * Sample `fn` at SAMPLES points plus extra breakpoints near `extras`,
 * mapping `tLocal` (in tMin..tMax) to SVG coordinates.
 *
 * `tLocalToSvgX` maps the local t range to an SVG x position.
 */
function makePath(
    fn: (tLocal: number) => number,
    tMin: number,
    tMax: number,
    tLocalToSvgX: (tLocal: number) => number,
    iH: number,
    py: number,
    extras: number[] = [],
): string {
    const SAMPLES = 80;
    const ts = new Set<number>();
    const range = tMax - tMin;
    for (let i = 0; i <= SAMPLES; i++) ts.add(tMin + (i / SAMPLES) * range);
    for (const e of extras) {
        ts.add(Math.max(tMin, e - 0.001));
        ts.add(e);
        ts.add(Math.min(tMax, e + 0.001));
    }
    return Array.from(ts)
        .sort((a, b) => a - b)
        .map((tLocal) => {
            const x = tLocalToSvgX(tLocal).toFixed(1);
            const y = (py + (1 - fn(tLocal)) * iH).toFixed(1);
            return `${x},${y}`;
        })
        .join(' ');
}

function CombinedCurve({ enterEase, exitEase, enterStart, exitEnd }: CombinedCurveProps) {
    const W  = 240;
    const H  = 64;
    const px = 6;
    const py = 6;
    const iW = W - px * 2;
    const iH = H - py * 2;

    // Center X in SVG coords — represents "now" (step boundary)
    const xCenter = px + iW / 2;

    // ── Enter curve: local t in [-1, 0] ──────────────────────────────────────
    // t_local = -1 → start of previous transition (opacity = 0 if not yet entered)
    // t_local =  0 → "now" (opacity = 1)
    // Map to interpolation t: t = t_local + 1  (−1..0 → 0..1)
    const enterToSvgX = (tLocal: number) => xCenter + (tLocal / 1) * (iW / 2);
    const enterBreak  = enterStart - 1; // enterStart in [0,1] → local [-1,0]
    const enterPts = makePath(
        (tLocal) => enterOpacity(enterEase, enterStart, tLocal + 1),
        -1, 0,
        enterToSvgX,
        iH, py,
        [enterBreak],
    );

    // ── Exit curve: local t in [0, 1] ────────────────────────────────────────
    // t_local = 0 → "now" (opacity = 1)
    // t_local = 1 → end of next transition (opacity = 0 after exitEnd)
    // Map directly to interpolation t
    const exitToSvgX = (tLocal: number) => xCenter + tLocal * (iW / 2);
    const exitPts = makePath(
        (tLocal) => exitOpacity(exitEase, exitEnd, tLocal),
        0, 1,
        exitToSvgX,
        iH, py,
        [exitEnd],
    );

    // Vertical slider markers
    const xEnterMarker = enterToSvgX(enterBreak);  // where enter animation starts
    const xExitMarker  = exitToSvgX(exitEnd);        // where exit animation ends

    const yMid = py + iH / 2;

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height={H}
            style={{ display: 'block', overflow: 'visible' }}
        >
            {/* Baseline (opacity=0) */}
            <line x1={px} y1={py + iH} x2={px + iW} y2={py + iH}
                stroke={tokens.colorNeutralStroke2} strokeWidth="1" />
            {/* Top line (opacity=1) */}
            <line x1={px} y1={py} x2={px + iW} y2={py}
                stroke={tokens.colorNeutralStroke2} strokeWidth="1" strokeDasharray="2 3" />
            {/* Mid-opacity guideline */}
            <line x1={px} y1={yMid} x2={px + iW} y2={yMid}
                stroke={tokens.colorNeutralStroke2} strokeWidth="1" strokeDasharray="1 4" opacity="0.4" />

            {/* Center divider — "now" */}
            <line x1={xCenter} y1={py} x2={xCenter} y2={py + iH}
                stroke={tokens.colorNeutralForeground3} strokeWidth="1" opacity="0.6" />

            {/* Enter curve — brand blue (left half) */}
            <polyline
                points={enterPts}
                fill="none"
                stroke={tokens.colorBrandForeground1}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Exit curve — warm orange (right half) */}
            <polyline
                points={exitPts}
                fill="none"
                stroke={tokens.colorStatusWarningForeground1}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Enter start marker (dashed, blue) */}
            <line x1={xEnterMarker} y1={py} x2={xEnterMarker} y2={py + iH}
                stroke={tokens.colorBrandForeground1}
                strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
            {/* Exit end marker (dashed, orange) */}
            <line x1={xExitMarker} y1={py} x2={xExitMarker} y2={py + iH}
                stroke={tokens.colorStatusWarningForeground1}
                strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
        </svg>
    );
}

// ─── Preview hook ─────────────────────────────────────────────────────────────

function useEasingPreview(active: boolean, baseStep: number, stepsCount: number) {
    const playback = useOptionalPlayback();
    const rafRef   = useRef<number>(0);
    const startRef = useRef<number | null>(null);
    const PERIOD_MS = 2000;

    const stop = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        startRef.current = null;
    }, []);

    useEffect(() => {
        if (!active || !playback || stepsCount < 2) {
            stop();
            return;
        }
        const maxStep  = stepsCount - 1;
        const fromStep = Math.min(baseStep, maxStep - 1);

        const tick = (now: number) => {
            if (startRef.current === null) startRef.current = now;
            const frac = ((now - startRef.current) % PERIOD_MS) / PERIOD_MS;
            playback.setPlaybackTime(fromStep + frac);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            stop();
            playback.setPlaybackTime(Math.round(playback.state.playbackTime));
        };
    }, [active, baseStep, stepsCount, playback, stop]);
}

// ─── Main control ─────────────────────────────────────────────────────────────

export const AnimationControl: React.FC<PropertiesControlProps<SceneObject>> = ({ objects }) => {
    const classes  = useStyles();
    const { dispatch, scene } = useScene();
    const playback = useOptionalPlayback();

    // Keyed to current selection so preview auto-stops when selection changes
    const [previewForIds, setPreviewForIds] = useState<string | null>(null);
    const objectIds  = objects.map((o) => o.id).join(',');
    const showPreview = previewForIds === objectIds;

    const baseStep   = playback ? Math.floor(playback.state.playbackTime) : 0;
    const stepsCount = scene.steps.length;
    useEasingPreview(showPreview, baseStep, stepsCount);

    const enterEase  = commonValue(objects, (obj) => obj.animation?.enterEase  ?? 'instant') ?? 'instant';
    const exitEase   = commonValue(objects, (obj) => obj.animation?.exitEase   ?? 'instant') ?? 'instant';
    const enterStart = commonValue(objects, (obj) => obj.animation?.enterStart ?? 0.5) ?? 0.5;
    const exitEnd    = commonValue(objects, (obj) => obj.animation?.exitEnd    ?? 0.5) ?? 0.5;
    const pulse      = commonValue(objects, (obj) => obj.animation?.pulse      ?? 'none') ?? 'none';
    const smoothness = commonValue(objects, (obj) => obj.animation?.smoothness ?? 0) ?? 0;

    const [dragging, setDragging] = useState(false);

    function updateAnimation(patch: Partial<AnimationProps>, transient = false) {
        dispatch({
            type: 'update',
            value: objects.map((obj) => ({ ...obj, animation: { ...obj.animation, ...patch } })),
            transient,
        });
    }

    const onEnterStartChange = (_: unknown, d: SliderOnChangeData) => updateAnimation({ enterStart: d.value }, dragging);
    const onExitEndChange    = (_: unknown, d: SliderOnChangeData) => updateAnimation({ exitEnd: d.value }, dragging);
    const onSmoothnessChange = (_: unknown, d: SliderOnChangeData) => updateAnimation({ smoothness: d.value }, dragging);

    return (
        <div className={classes.root}>
            {/* ── Easing selectors (Enter left, Exit right — matches curve halves) ── */}
            <div className={classes.easingRow}>
                <Field label="Enter" className={classes.easeField}>
                    <Select
                        value={enterEase}
                        onChange={(_, d) => updateAnimation({ enterEase: d.value as EasingStyle })}
                        size="small"
                    >
                        {EASING_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </Field>
                <Field label="Exit" className={classes.easeField}>
                    <Select
                        value={exitEase}
                        onChange={(_, d) => updateAnimation({ exitEase: d.value as EasingStyle })}
                        size="small"
                    >
                        {EASING_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </Select>
                </Field>
            </div>

            {/* ── Combined curve ── */}
            <CombinedCurve
                enterEase={enterEase}
                exitEase={exitEase}
                enterStart={enterStart}
                exitEnd={exitEnd}
            />

            {/* ── Timing sliders: side-by-side, each spanning one half of the curve ── */}
            <div className={classes.slidersRow}>
                <div className={classes.halfSlider}>
                    <Slider
                        min={0} max={1} step={0.05}
                        value={enterStart}
                        onChange={onEnterStartChange}
                        onMouseDown={() => setDragging(true)}
                        onMouseUp={() => setDragging(false)}
                        size="small"
                    />
                    <Label className={classes.sliderCaptionEnter}>
                        Start {Math.round(enterStart * 100)}%
                    </Label>
                </div>
                <div className={classes.halfSlider}>
                    <Slider
                        min={0} max={1} step={0.05}
                        value={exitEnd}
                        onChange={onExitEndChange}
                        onMouseDown={() => setDragging(true)}
                        onMouseUp={() => setDragging(false)}
                        size="small"
                    />
                    <Label className={classes.sliderCaptionExit}>
                        End {Math.round(exitEnd * 100)}%
                    </Label>
                </div>
            </div>

            <div className={classes.divider} />

            {/* ── Smoothness (Catmull-Rom, tracked objects only) ── */}
            <div className={classes.smoothRow}>
                <Label className={classes.smoothLabel}>Smooth</Label>
                <Slider
                    min={0} max={1} step={0.05}
                    value={smoothness}
                    onChange={onSmoothnessChange}
                    onMouseDown={() => setDragging(true)}
                    onMouseUp={() => setDragging(false)}
                    size="small"
                    className={classes.smoothSlider}
                />
                <Label className={classes.smoothValueLabel}>
                    {Math.round(smoothness * 100)}%
                </Label>
            </div>

            <div className={classes.divider} />

            {/* ── Pulse ── */}
            <Field label="Pulse">
                <Select
                    value={pulse}
                    onChange={(_, d) => updateAnimation({ pulse: d.value as PulseStyle })}
                    size="small"
                >
                    {PULSE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </Select>
            </Field>

            {/* ── Preview ── */}
            {playback && stepsCount >= 2 && (
                <Checkbox
                    label="Show preview"
                    checked={showPreview}
                    onChange={(_, d) => setPreviewForIds(d.checked ? objectIds : null)}
                    size="medium"
                />
            )}
        </div>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    easingRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
    },
    easeField: {
        flex: '1 1 0',
    },
    slidersRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: 0,
    },
    halfSlider: {
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    sliderCaptionEnter: {
        textAlign: 'center',
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorBrandForeground1,
    },
    sliderCaptionExit: {
        textAlign: 'center',
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorStatusWarningForeground1,
    },
    divider: {
        height: '1px',
        backgroundColor: tokens.colorNeutralStroke2,
        margin: '2px 0',
    },
    smoothRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '4px',
    },
    smoothLabel: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground2,
        flexShrink: 0,
    },
    smoothSlider: {
        flex: '1 1 0',
        minWidth: 0,
    },
    smoothValueLabel: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground2,
        flexShrink: 0,
        minWidth: '28px',
        textAlign: 'right',
    },
});
