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
import { PlaybackProvider, usePlayback } from './playback/PlaybackContext';
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

const MainPageContent: React.FC = () => {
    const classes = useStyles();
    const title = usePageTitle();
    const { scene, dispatch, stepIndex } = useScene();
    const { state, setPlaybackTime, togglePlay } = usePlayback();
    const { isPlaying, playbackTime } = state;
    const maxStep = scene.steps.length - 1;
    const [classicMode, setClassicMode] = useState(false);

    // Keep refs so effects always see current values without being re-registered.
    const playbackTimeRef = useRef(playbackTime);
    playbackTimeRef.current = playbackTime;
    const isPlayingRef = useRef(isPlaying);
    isPlayingRef.current = isPlaying;
    // stepIndexRef captures the step the reducer committed to (e.g. addStep → new step index).
    const stepIndexRef = useRef(stepIndex);
    stepIndexRef.current = stepIndex;

    // When the user edits the scene, snap playbackTime to the reducer's current step and stop
    // playing. Using stepIndexRef means addStep (which sets currentStep = newStep) will jump the
    // slider to the new step, while normal edits (drag etc.) keep floor(playbackTime) since the
    // floorStep effect already syncs stepIndex = floor(playbackTime) during scrub/play.
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

    // Keep SceneProvider's currentStep = floor(playbackTime) while scrubbing or
    // playing so that object IDs in the interpolated view map to the correct step
    // for drag/edit operations.
    //
    // Uses transient: true so step navigation during playback is never pushed onto
    // the undo stack. The tab selection in StepSelect is the user's canonical
    // editing step; this is a transient override that follows the slider.
    const floorStep = Math.min(Math.floor(playbackTime), maxStep);
    useEffect(() => {
        dispatch({ type: 'setStep', index: floorStep, transient: true });
    }, [floorStep]);

    return (
        <>
            <title>{title}</title>

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
