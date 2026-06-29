import { makeStyles, tokens } from '@fluentui/react-components';
import React, { useEffect, useRef, useState } from 'react';
import { EditModeProvider } from './EditModeProvider';
import { RegularHotkeyHandler } from './HotkeyHandler';
import { MainToolbar } from './MainToolbar';
import { PanelDragProvider } from './PanelDragProvider';
import { SceneLoadErrorNotifier } from './SceneLoadErrorNotifier';
import { useScene } from './SceneProvider';
import { SelectionProvider } from './SelectionProvider';
import { StepSelect } from './StepSelect';
import { DetailsPanel } from './panel/DetailsPanel';
import { MainPanel } from './panel/MainPanel';
import { PlaybackProvider, usePlayback, usePlaybackDispatch } from './playback/PlaybackContext';
import { PlaybackTimeline } from './playback/PlaybackTimeline';
import { SceneRenderer } from './render/SceneRenderer';
import { MIN_STAGE_WIDTH } from './theme';
import { useIsDirty } from './useIsDirty';
import { removeFileExtension } from './util';

export const MainPage: React.FC = () => {
    return (
        <PlaybackProvider>
            <EditModeProvider>
                <SelectionProvider>
                    <PanelDragProvider>
                        <MainPageContent />
                    </PanelDragProvider>
                </SelectionProvider>
            </EditModeProvider>
        </PlaybackProvider>
    );
};

/**
 * Null-rendering bridge: subscribes to PlaybackContext and dispatches setStep at
 * integer boundaries so SceneProvider's currentStep tracks floor(playbackTime).
 * Lives as a sibling of the main content so its 60fps re-renders during playback
 * don't cascade to the entire page subtree.
 */
const PlaybackSyncer: React.FC = () => {
    const { scene, dispatch } = useScene();
    const { state } = usePlayback();
    const { playbackTime, isPlaying } = state;
    const maxStep = scene.steps.length - 1;
    const floorStep = Math.min(Math.floor(playbackTime), maxStep);
    useEffect(() => {
        // During auto-play the renderer interpolates directly from scene.steps[], so
        // SceneProvider's currentStep doesn't need to track every step boundary.
        // We only sync on scrub/pause so editing interactions use the right step.
        if (!isPlaying) {
            dispatch({ type: 'setStep', index: floorStep, transient: true });
        }
    }, [floorStep, isPlaying, dispatch]);
    return null;
};

const MainPageContent: React.FC = () => {
    const classes = useStyles();
    const title = usePageTitle();
    const { scene, dispatch, stepIndex } = useScene();
    // Use dispatch context (stable, never re-renders on playbackTime changes)
    // instead of usePlayback() so the entire page subtree doesn't re-render at 60fps.
    const { setPlaybackTime, togglePlay, isPlayingRef } = usePlaybackDispatch();
    const maxStep = scene.steps.length - 1;
    const [classicMode, setClassicMode] = useState(false);

    // stepIndexRef captures the step the reducer committed to (e.g. addStep → new step index).
    const stepIndexRef = useRef(stepIndex);
    stepIndexRef.current = stepIndex;

    // When the user edits the scene, snap playbackTime to the reducer's current step and stop
    // playing. Using stepIndexRef means addStep (which sets currentStep = newStep) will jump the
    // slider to the new step, while normal edits (drag etc.) keep floor(playbackTime) since
    // PlaybackSyncer already keeps stepIndex = floor(playbackTime) during scrub/play.
    const initialSceneRef = useRef(scene);
    useEffect(() => {
        if (scene !== initialSceneRef.current) {
            const target = Math.min(stepIndexRef.current, maxStep);
            setPlaybackTime(target);
            dispatch({ type: 'setStep', index: target, transient: true });
            if (isPlayingRef.current) {
                togglePlay();
            }
        }
        initialSceneRef.current = scene;
    }, [scene]);

    return (
        <>
            <title>{title}</title>

            {/* Keeps SceneProvider's currentStep = floor(playbackTime) during play/scrub.
                Rendered as a sibling so its 60fps subscription doesn't cascade to the page. */}
            <PlaybackSyncer />

            <RegularHotkeyHandler />
            <SceneLoadErrorNotifier />

            <MainToolbar />

            {/* TODO: make panel collapsable */}
            <MainPanel />

            <div className={classes.steps}>
                {classicMode && <StepSelect />}
                <PlaybackTimeline
                    classicMode={classicMode}
                    onToggleClassicMode={() => setClassicMode((c) => !c)}
                />
            </div>

            <div className={classes.stage}>
                <SceneRenderer />
            </div>

            {/* TODO: make panel collapsable */}
            <DetailsPanel />
        </>
    );
};

const TITLE = 'XIVPlan';

function usePageTitle() {
    const { source } = useScene();
    const isDirty = useIsDirty();

    let title = TITLE;
    if (source) {
        title += ': ';
        title += removeFileExtension(source?.name);
    }
    if (isDirty) {
        title += ' ●';
    }
    return title;
}

const useStyles = makeStyles({
    steps: {
        gridArea: 'steps',
        display: 'flex',
        flexFlow: 'column',
        minWidth: MIN_STAGE_WIDTH,
        backgroundColor: tokens.colorNeutralBackground2,
    },
    stage: {
        gridArea: 'content',
        display: 'flex',
        flexFlow: 'row',
        justifyContent: 'center',
        overflow: 'auto',
        minWidth: MIN_STAGE_WIDTH,
        backgroundColor: tokens.colorNeutralBackground1,
    },
});
