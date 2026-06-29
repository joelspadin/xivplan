/**
 * PlaybackTimeline — shown in place of StepSelect when playback mode is active.
 *
 * Renders a fractional slider (0 → steps.length-1), step markers, play/pause,
 * speed control, and an "Exit Playback" button.
 */

import {
    Button,
    Label,
    Select,
    Slider,
    ToggleButton,
    Tooltip,
    makeStyles,
    mergeClasses,
    tokens,
    typographyStyles,
} from '@fluentui/react-components';
import { ArrowResetRegular, PauseRegular, PlayRegular, TabDesktopMultipleRegular } from '@fluentui/react-icons';
import React, { memo, useEffect } from 'react';
import { CrossStepSelection } from '../CrossStepContext';
import { useScene } from '../SceneProvider';
import { AddStepButton, RemoveStepButton, ReorderStepsButton } from '../StepSelect';
import { useCrossStepSelection, useSelection, useSimilarObjects } from '../selection';
import { usePlayback, usePlaybackDispatch } from './PlaybackContext';

interface PlaybackTimelineProps {
    classicMode: boolean;
    onToggleClassicMode: () => void;
}

export const PlaybackTimeline: React.FC<PlaybackTimelineProps> = ({ classicMode, onToggleClassicMode }) => {
    const classes = useStyles();
    const { scene, dispatch } = useScene();
    const { state, setPlaybackTime, togglePlay, setSpeed, updateMaxStep } = usePlayback();
    const { isPlaying, playbackTime, speed } = state;

    const stepCount = scene.steps.length;
    const maxStep = stepCount - 1;
    const currentStepIndex = Math.min(Math.floor(playbackTime), maxStep);

    // Keep RAF loop aware of current maxStep
    useEffect(() => {
        updateMaxStep(maxStep);
    }, [maxStep, updateMaxStep]);

    const handleSliderChange = (_: React.ChangeEvent<HTMLInputElement>, data: { value: number }) => {
        setPlaybackTime(data.value);
    };

    const handleReset = () => {
        setPlaybackTime(0);
        dispatch({ type: 'setStep', index: 0 });
    };

    const handleSpeedChange = (_: React.ChangeEvent<HTMLSelectElement>) => {
        setSpeed(parseFloat(_.target.value));
    };

    const stepLabel = `Step ${currentStepIndex + 1} / ${stepCount}`;

    return (
        <div className={classes.root} style={{ maxWidth: scene.arena.width + scene.arena.padding * 2 }}>
            {/* Controls row */}
            <div className={classes.controls}>
                <AddStepButton size="small" />

                <Tooltip content={isPlaying ? 'Pause' : 'Play'} relationship="label" withArrow>
                    <Button
                        appearance="subtle"
                        icon={isPlaying ? <PauseRegular /> : <PlayRegular />}
                        onClick={togglePlay}
                        size="small"
                    />
                </Tooltip>

                <Tooltip content="Reset to start" relationship="label" withArrow>
                    <Button appearance="subtle" icon={<ArrowResetRegular />} onClick={handleReset} size="small" />
                </Tooltip>

                <Label className={classes.stepLabel}>{stepLabel}</Label>

                <div className={classes.speedWrapper}>
                    <Label className={classes.speedLabel}>Speed</Label>
                    <Select
                        value={speed.toString()}
                        onChange={handleSpeedChange}
                        size="small"
                        className={classes.speedSelect}
                    >
                        <option value="0.25">0.25×</option>
                        <option value="0.5">0.5×</option>
                        <option value="0.75">0.75×</option>
                        <option value="1">1×</option>
                        <option value="2">2×</option>
                        <option value="4">4×</option>
                    </Select>
                    <Tooltip
                        content={classicMode ? 'Switch to timeline navigation' : 'Switch to classic tab navigation'}
                        relationship="label"
                        withArrow
                    >
                        <ToggleButton
                            appearance="subtle"
                            icon={<TabDesktopMultipleRegular />}
                            checked={classicMode}
                            onClick={onToggleClassicMode}
                            size="small"
                        />
                    </Tooltip>
                    <ReorderStepsButton />
                    <RemoveStepButton />
                </div>
            </div>

            {/* Timeline slider */}
            <div className={classes.sliderRow}>
                <Slider
                    className={classes.slider}
                    min={0}
                    max={maxStep}
                    step={0.01}
                    value={playbackTime}
                    onChange={handleSliderChange}
                />
            </div>

            {/* Step markers — isolated component so that:
                  - memo() skips re-renders when currentStepIndex doesn't change (most 60fps frames)
                  - selection/similar changes don't re-render the slider/controls above */}
            {stepCount > 1 && (
                <PlaybackStepMarkers stepCount={stepCount} maxStep={maxStep} currentStepIndex={currentStepIndex} />
            )}
        </div>
    );
};

interface PlaybackStepMarkersProps {
    stepCount: number;
    maxStep: number;
    currentStepIndex: number;
}

const PlaybackStepMarkers = memo(function PlaybackStepMarkers({
    stepCount,
    maxStep,
    currentStepIndex,
}: PlaybackStepMarkersProps) {
    const classes = useStyles();
    const { dispatch } = useScene();
    const { setPlaybackTime } = usePlaybackDispatch();
    const { filters, positionTolerance, selection: crossStep, setSelection: setCrossStep } = useCrossStepSelection();
    const similar = useSimilarObjects(filters, positionTolerance);
    const [, setSelection] = useSelection();

    const handleStepClick = (i: number, e: React.MouseEvent) => {
        const isCtrl = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;

        if ((isCtrl || isShift) && similar.has(i)) {
            if (isCtrl) {
                const next = new Map(crossStep);
                if (next.has(i)) {
                    next.delete(i);
                } else {
                    next.set(i, similar.get(i)!);
                }
                setCrossStep(next as CrossStepSelection);
            } else {
                const from = Math.min(currentStepIndex, i);
                const to = Math.max(currentStepIndex, i);
                const next = new Map(crossStep);
                for (let j = from; j <= to; j++) {
                    const ids = similar.get(j);
                    if (ids) next.set(j, ids);
                }
                setCrossStep(next as CrossStepSelection);
            }
            return;
        }

        setPlaybackTime(i);
        dispatch({ type: 'setStep', index: i });

        const stepCrossSelection = crossStep.get(i);
        if (stepCrossSelection) {
            setSelection(stepCrossSelection);
        }
    };

    return (
        <div className={classes.markers}>
            {Array.from({ length: stepCount }, (_, i) => {
                const pct = maxStep > 0 ? (i / maxStep) * 100 : 0;
                const isActive = i === currentStepIndex;
                const hasSimilar = similar.has(i);
                const isInCrossStep = crossStep.has(i);
                const tooltip = isInCrossStep
                    ? `Step ${i + 1} — in cross-page selection (Ctrl+click to remove)`
                    : hasSimilar
                      ? `Step ${i + 1} — has matching objects (Ctrl+click to add)`
                      : `Step ${i + 1}`;
                return (
                    <button
                        key={i}
                        className={mergeClasses(
                            classes.marker,
                            isActive && classes.markerActive,
                            hasSimilar && !isInCrossStep && classes.markerHasSimilar,
                            isInCrossStep && classes.markerInCrossStep,
                        )}
                        style={{ left: `${pct}%` }}
                        onClick={(e) => handleStepClick(i, e)}
                        title={tooltip}
                    >
                        {i + 1}
                    </button>
                );
            })}
        </div>
    );
});

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexFlow: 'column',
        gap: tokens.spacingVerticalXS,
        padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
        borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
        userSelect: 'none',
    },

    controls: {
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },

    stepLabel: {
        ...typographyStyles.caption1,
        color: tokens.colorNeutralForeground2,
        minWidth: '80px',
    },

    speedWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
        marginLeft: 'auto',
    },

    speedLabel: {
        ...typographyStyles.caption1,
        color: tokens.colorNeutralForeground2,
    },

    speedSelect: {
        minWidth: '70px',
    },

    sliderRow: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: tokens.spacingHorizontalXS,
        paddingRight: tokens.spacingHorizontalXS,
    },

    slider: {
        width: '100%',
    },

    markers: {
        position: 'relative',
        height: '20px',
        // Offset to align with the slider thumb track area (Fluent slider adds ~12px padding each side)
        marginLeft: '14px',
        marginRight: '14px',
    },

    marker: {
        position: 'absolute',
        transform: 'translateX(-50%)',
        padding: '0 2px',
        border: 'none',
        borderRadius: tokens.borderRadiusSmall,
        backgroundColor: tokens.colorNeutralBackground4,
        color: tokens.colorNeutralForeground2,
        cursor: 'pointer',
        ...typographyStyles.caption2,
        lineHeight: '18px',

        ':hover': {
            backgroundColor: tokens.colorNeutralBackground4Hover,
            color: tokens.colorNeutralForeground1,
        },
    },

    markerActive: {
        backgroundColor: tokens.colorBrandBackground,
        color: tokens.colorNeutralForegroundOnBrand,

        ':hover': {
            backgroundColor: tokens.colorBrandBackgroundHover,
            color: tokens.colorNeutralForegroundOnBrand,
        },
    },

    markerHasSimilar: {
        outline: `2px dashed ${tokens.colorBrandStroke2}`,
        outlineOffset: '1px',
    },

    markerInCrossStep: {
        outline: `2px solid ${tokens.colorBrandStroke1}`,
        outlineOffset: '1px',
        backgroundColor: tokens.colorBrandBackground2,
        color: tokens.colorBrandForeground1,

        ':hover': {
            backgroundColor: tokens.colorBrandBackground2Hover,
            color: tokens.colorBrandForeground1,
        },
    },
});
