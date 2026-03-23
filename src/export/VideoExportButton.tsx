/**
 * VideoExportButton — exports the playback animation as a 60 FPS WebM video.
 *
 * Rendering: frames are produced off-screen by a hidden ScenePreview driven
 * by StaticPlaybackProvider, one frame per React state tick.
 *
 * Encoding: uses the WebCodecs VideoEncoder API + webm-muxer so every frame
 * gets an explicit microsecond timestamp, guaranteeing correct video duration
 * regardless of how long each React render actually takes.
 *
 * Video layout:
 *   [200ms hold at step 0] + [step 0 → step N animation] + [200ms hold at step N]
 */

import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    Field,
    Label,
    Portal,
    ProgressBar,
    Select,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import { VideoRegular } from '@fluentui/react-icons';
import Konva from 'konva';
import React, { PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { ArrayBufferTarget, Muxer } from 'webm-muxer';
import { CollapsableToolbarButton } from '../CollapsableToolbarButton';
import { getCanvasSize } from '../coord';
import { downloadBlob } from '../file/blob';
import { ObjectLoadingContext } from '../ObjectLoadingContext';
import { ObjectLoadingProvider } from '../ObjectLoadingProvider';
import { StaticPlaybackProvider, useOptionalPlayback } from '../playback/PlaybackContext';
import { ScenePreview } from '../render/SceneRenderer';
import { useScene } from '../SceneProvider';

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPORT_FPS = 60;
/** 200 ms hold at the beginning and end of the video. */
const PAUSE_FRAMES = Math.round(0.2 * EXPORT_FPS); // 12 frames

const SPEED_OPTIONS = [
    { value: 0.25, label: '0.25×' },
    { value: 0.5, label: '0.5×' },
    { value: 0.75, label: '0.75×' },
    { value: 1, label: '1×' },
    { value: 2, label: '2×' },
    { value: 4, label: '4×' },
];

const RESOLUTION_OPTIONS = [
    { value: 1, label: '1× (native)' },
    { value: 2, label: '2× (crisp)' },
];

// ─── Frame timing helpers ─────────────────────────────────────────────────────

/**
 * Number of content frames needed to animate from step 0 to step maxStep.
 * +1 so the last content frame is pinned exactly to maxStep (avoids float
 * under-shoot at the end, e.g. (160/60)*0.75 = 1.9999…).
 */
function contentFrameCount(maxStep: number, speed: number): number {
    return Math.ceil((maxStep / speed) * EXPORT_FPS) + 1;
}

/** Total frames including the start and end pause. */
function totalFrameCount(maxStep: number, speed: number): number {
    return PAUSE_FRAMES + contentFrameCount(maxStep, speed) + PAUSE_FRAMES;
}

/**
 * Map a frame index to a playbackTime value (0 → maxStep).
 *
 * - Start-pause region  (frame < PAUSE_FRAMES)               → 0
 * - Last content frame and end-pause region                   → maxStep (pinned)
 * - Animation region in between                               → linear ramp
 */
function frameToPlaybackTime(frame: number, maxStep: number, speed: number): number {
    if (frame < PAUSE_FRAMES) return 0;

    const contentFrame = frame - PAUSE_FRAMES;
    const contentFrames = contentFrameCount(maxStep, speed);

    // Pin last content frame + all end-pause frames to maxStep
    if (contentFrame >= contentFrames - 1) return maxStep;

    return (contentFrame / EXPORT_FPS) * speed;
}

// ─── Capture component ────────────────────────────────────────────────────────

interface VideoCaptureProps {
    speed: number;
    pixelRatio: number;
    onProgress: (p: number) => void;
    onComplete: (blob: Blob) => void;
    onError: (err: unknown) => void;
    cancelRef: React.RefObject<boolean>;
}

/**
 * Hidden off-screen component that renders each frame via StaticPlaybackProvider
 * and encodes it with VideoEncoder (WebCodecs) + webm-muxer.
 *
 * Each VideoFrame receives an explicit microsecond timestamp so the output
 * video always has the correct 60 FPS duration, independent of render speed.
 *
 * Must be wrapped in ObjectLoadingProvider.
 */
const VideoCapture: React.FC<VideoCaptureProps> = ({
    speed,
    pixelRatio,
    onProgress,
    onComplete,
    onError,
    cancelRef,
}) => {
    const { scene } = useScene();
    const size = getCanvasSize(scene);
    const maxStep = scene.steps.length - 1;
    const totalFrames = totalFrameCount(maxStep, speed);

    const stageRef = useRef<Konva.Stage>(null);
    const { isLoading } = useContext(ObjectLoadingContext);

    // -1 = waiting for images, ≥0 = frame index being rendered
    const [frame, setFrame] = useState(-1);

    // WebCodecs encoder + muxer, initialised once on mount
    const encoderRef = useRef<{
        encoder: VideoEncoder;
        muxer: Muxer<ArrayBufferTarget>;
        target: ArrayBufferTarget;
    } | null>(null);

    useEffect(() => {
        // VideoEncoder.configure() is synchronous, so encoderRef is ready before
        // any other effects run. This avoids a race where the start-condition
        // effect fires with isLoading=false before the async detectCodec resolves.
        const w = Math.round(size.width * pixelRatio);
        const h = Math.round(size.height * pixelRatio);

        const target = new ArrayBufferTarget();
        const muxer = new Muxer({
            target,
            video: { codec: 'V_VP9', width: w, height: h, frameRate: EXPORT_FPS },
        });

        const encoder = new VideoEncoder({
            output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
            error: (e) => onError(e),
        });

        encoder.configure({
            codec: 'vp09.00.10.08',
            width: w,
            height: h,
            bitrate: 12_000_000,
            framerate: EXPORT_FPS,
        });

        encoderRef.current = { encoder, muxer, target };

        return () => {
            if (encoder.state !== 'closed') encoder.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Start once images are loaded
    useEffect(() => {
        if (frame === -1 && !isLoading && encoderRef.current) {
            setFrame(0);
        }
    }, [frame, isLoading]);

    // Capture frame N then advance to N+1
    useEffect(() => {
        if (frame < 0 || !stageRef.current || !encoderRef.current) return;

        const { encoder, muxer, target } = encoderRef.current;

        if (cancelRef.current) return;

        const doCapture = async () => {
            try {
                // Render the scene to a canvas and wrap in a VideoFrame with an
                // explicit timestamp — this is what guarantees correct video timing.
                const frameCanvas = stageRef.current!.toCanvas({ pixelRatio });
                const bitmap = await createImageBitmap(frameCanvas);
                const timestamp = Math.round((frame * 1_000_000) / EXPORT_FPS); // µs
                const duration = Math.round(1_000_000 / EXPORT_FPS);
                const videoFrame = new VideoFrame(bitmap, { timestamp, duration });

                encoder.encode(videoFrame, { keyFrame: frame % 60 === 0 });
                videoFrame.close();
                bitmap.close();

                onProgress((frame + 1) / totalFrames);

                if (frame + 1 >= totalFrames) {
                    await encoder.flush();
                    muxer.finalize();
                    const blob = new Blob([target.buffer], { type: 'video/webm' });
                    onComplete(blob);
                } else {
                    // Yield to the browser so encoding work can be processed
                    setTimeout(() => setFrame((f) => f + 1), 0);
                }
            } catch (err) {
                onError(err);
            }
        };

        doCapture();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [frame]);

    const playbackTime = frame < 0 ? 0 : frameToPlaybackTime(frame, maxStep, speed);
    const pulseTime = Math.max(0, frame / EXPORT_FPS) % 1000;

    return (
        <StaticPlaybackProvider playbackTime={playbackTime} pulseTime={pulseTime}>
            <ScenePreview ref={stageRef} scene={scene} width={size.width} height={size.height} />
        </StaticPlaybackProvider>
    );
};

// ─── Main button + dialog ─────────────────────────────────────────────────────

export const VideoExportButton: React.FC<PropsWithChildren> = ({ children }) => {
    const classes = useStyles();
    const { scene } = useScene();
    const playback = useOptionalPlayback();

    const [open, setOpen] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [pixelRatio, setPixelRatio] = useState(1);
    const [exporting, setExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const cancelRef = useRef(false);

    const { source } = useScene();
    const disabled = scene.steps.length < 2 || !playback;
    const maxStep = scene.steps.length - 1;
    const totalFrames = disabled ? 0 : totalFrameCount(maxStep, speed);
    const totalSecs = totalFrames / EXPORT_FPS;

    const handleExport = () => {
        cancelRef.current = false;
        setProgress(0);
        setExporting(true);
    };

    const handleCancel = () => {
        cancelRef.current = true;
        setExporting(false);
        setProgress(0);
    };

    const handleComplete = (blob: Blob) => {
        const baseName = source?.name
            ? source.name.replace(/\.[^.]+$/, '')  // strip file extension
            : 'animation';
        downloadBlob(blob, `${baseName}.webm`);
        setExporting(false);
        setProgress(0);
        setOpen(false);
    };

    const handleError = (err: unknown) => {
        console.error('Video export failed:', err);
        setExporting(false);
        setProgress(0);
    };

    return (
        <>
            <CollapsableToolbarButton
                icon={<VideoRegular />}
                onClick={() => setOpen(true)}
                disabled={disabled}
            >
                {children}
            </CollapsableToolbarButton>

            <Dialog open={open} onOpenChange={(_, d) => { if (!exporting) setOpen(d.open); }}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Export video</DialogTitle>
                        <DialogContent className={classes.content}>
                            <div className={classes.optionsRow}>
                                <Field label="Speed" className={classes.optionField}>
                                    <Select
                                        value={speed.toString()}
                                        onChange={(_, d) => setSpeed(parseFloat(d.value))}
                                        disabled={exporting}
                                        size="small"
                                    >
                                        {SPEED_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </Select>
                                </Field>
                                <Field label="Resolution" className={classes.optionField}>
                                    <Select
                                        value={pixelRatio.toString()}
                                        onChange={(_, d) => setPixelRatio(parseInt(d.value))}
                                        disabled={exporting}
                                        size="small"
                                    >
                                        {RESOLUTION_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </Select>
                                </Field>
                            </div>

                            {!exporting && (
                                <Label className={classes.note}>
                                    {totalFrames} frames · {totalSecs.toFixed(1)}s · 60 FPS · WebM (VP9)
                                </Label>
                            )}

                            {exporting && (
                                <div className={classes.progressSection}>
                                    <div className={classes.progressHeader}>
                                        <Label>Rendering…</Label>
                                        <Label className={classes.progressPct}>
                                            {Math.round(progress * 100)}%
                                        </Label>
                                    </div>
                                    <ProgressBar value={progress} />
                                </div>
                            )}
                        </DialogContent>

                        <DialogActions>
                            {exporting ? (
                                <Button appearance="secondary" onClick={handleCancel}>Cancel</Button>
                            ) : (
                                <>
                                    <Button appearance="secondary" onClick={() => setOpen(false)}>Close</Button>
                                    <Button appearance="primary" onClick={handleExport} disabled={disabled}>
                                        Export
                                    </Button>
                                </>
                            )}
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            {/* Hidden off-screen capture — mounted only while exporting */}
            {exporting && (
                <Portal mountNode={{ className: classes.hidden }}>
                    <ObjectLoadingProvider>
                        <VideoCapture
                            speed={speed}
                            pixelRatio={pixelRatio}
                            onProgress={setProgress}
                            onComplete={handleComplete}
                            onError={handleError}
                            cancelRef={cancelRef}
                        />
                    </ObjectLoadingProvider>
                </Portal>
            )}
        </>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
        minWidth: '280px',
    },
    optionsRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: tokens.spacingHorizontalM,
    },
    optionField: {
        flex: '1 1 0',
    },
    note: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    progressSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    progressHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressPct: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground2,
    },
    hidden: {
        position: 'fixed',
        left: '-9999px',
        top: '-9999px',
        visibility: 'hidden',
        pointerEvents: 'none',
    },
});
