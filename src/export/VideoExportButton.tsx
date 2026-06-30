/**
 * VideoExportButton — exports the playback animation as a WebM video.
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
    Select,
    ToggleButton,
    makeStyles,
    tokens,
} from '@fluentui/react-components';
import { AlertFilled, AlertOffRegular, AlertRegular, VideoRegular } from '@fluentui/react-icons';
import Konva from 'konva';
import React, { PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { ArrayBufferTarget, Muxer } from 'webm-muxer';
import { CollapsableToolbarButton } from '../CollapsableToolbarButton';
import { getCanvasSize } from '../coord';
import { downloadBlob } from '../file/blob';
import { ObjectLoadingContext } from '../ObjectLoadingContext';
import { ObjectLoadingProvider } from '../ObjectLoadingProvider';
import { useOptionalPlayback } from '../playback/PlaybackContext';
import { ScenePreview } from '../render/SceneRenderer';
import { useScene } from '../SceneProvider';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Flush the encoder every this many frames. Aligned with the keyframe interval so
 * each flush completes a clean segment. Prevents unbounded queue growth on large
 * exports, which would otherwise cause the browser to stall on the final flush.
 */
const ENCODER_FLUSH_INTERVAL = 60;

const DEFAULT_OPTIONS = {
    speed: 2,
    pixelRatio: 0.6,
    framerate: 30,
};

const SPEED_OPTIONS = [
    { value: 0.1, label: '0.1×' },
    { value: 0.2, label: '0.2×' },
    { value: 0.4, label: '0.4×' },
    { value: 0.6, label: '0.6×' },
    { value: 0.8, label: '0.8×' },
    { value: 1, label: '1×' },
    { value: 2, label: '2×' },
    { value: 3, label: '3×' },
    { value: 4, label: '4×' },
    { value: 5, label: '5×' },
];

const RESOLUTION_OPTIONS = [
    { value: 0.1, label: '0.1×' },
    { value: 0.2, label: '0.2×' },
    { value: 0.4, label: '0.4×' },
    { value: 0.6, label: '0.6×' },
    { value: 0.8, label: '0.8×' },
    { value: 1, label: '1×' },
    { value: 2, label: '2×' },
];

const FRAMERATE_OPTIONS = [
    { value: 8, label: '8 FPS' },
    { value: 16, label: '16 FPS' },
    { value: 24, label: '24 FPS' },
    { value: 30, label: '30 FPS' },
    { value: 48, label: '48 FPS' },
    { value: 60, label: '60 FPS' },
];

// ─── Frame timing helpers ─────────────────────────────────────────────────────

/**
 * Number of content frames needed to animate from step 0 to step maxStep.
 * +1 so the last content frame is pinned exactly to maxStep (avoids float
 * under-shoot at the end, e.g. (160/60)*0.75 = 1.9999…).
 */
function contentFrameCount(maxStep: number, speed: number, framerate: number): number {
    return Math.ceil((maxStep / speed) * framerate) + 1;
}

/** Number of frames to hold at the start and end of the video. */
function pausedFrameCount(speed: number, framerate: number): number {
    return Math.ceil(0.2 * framerate);
}

/** Total frames including the start and end pause. */
function totalFrameCount(maxStep: number, speed: number, framerate: number): number {
    return contentFrameCount(maxStep, speed, framerate) + pausedFrameCount(speed, framerate) * 2;
}
/**
 * Map a frame index to a playbackTime value (0 → maxStep).
 *
 * - Start-pause region  (frame < pausedFrames)               → 0
 * - Last content frame and end-pause region                   → maxStep (pinned)
 * - Animation region in between                               → linear ramp
 */
function frameToPlaybackTime(
    frame: number,
    maxStep: number,
    speed: number,
    framerate: number,
    pausedFrames: number,
): number {
    if (frame < pausedFrames) return 0;

    const contentFrame = frame - pausedFrames;
    const contentFrames = contentFrameCount(maxStep, speed, framerate);

    // Pin last content frame + all end-pause frames to maxStep
    if (contentFrame >= contentFrames - 1) return maxStep;

    return (contentFrame / framerate) * speed;
}

// ─── Capture component ────────────────────────────────────────────────────────

interface VideoCaptureProps {
    speed: number;
    pixelRatio: number;
    framerate: number;
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
 * video always has the correct set FPS duration, independent of render speed.
 *
 * Must be wrapped in ObjectLoadingProvider.
 */
const VideoCapture: React.FC<VideoCaptureProps> = ({
    speed,
    pixelRatio,
    framerate,
    onProgress,
    onComplete,
    onError,
    cancelRef,
}) => {
    const { scene } = useScene();
    const size = getCanvasSize(scene);
    const maxStep = scene.steps.length - 1;
    const totalFrames = totalFrameCount(maxStep, speed, framerate);

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
            video: { codec: 'V_VP9', width: w, height: h, frameRate: framerate },
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
            framerate: framerate,
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
                const timestamp = Math.round((frame * 1_000_000) / framerate); // µs
                const duration = Math.round(1_000_000 / framerate);
                const videoFrame = new VideoFrame(bitmap, { timestamp, duration });

                encoder.encode(videoFrame, { keyFrame: frame % ENCODER_FLUSH_INTERVAL === 0 });
                videoFrame.close();
                bitmap.close();

                // Flush incrementally at keyframe boundaries to drain the encoder queue
                // in small chunks. Without this, large exports accumulate hundreds of
                // queued frames and the browser stalls on the final flush.
                if (frame > 0 && frame % ENCODER_FLUSH_INTERVAL === 0) {
                    await encoder.flush();
                }

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

    const playbackTime =
        frame < 0 ? 0 : frameToPlaybackTime(frame, maxStep, speed, framerate, pausedFrameCount(speed, framerate) * 2);
    const pulseTime = Math.max(0, frame / framerate) % 1000;

    return (
        <ScenePreview
            ref={stageRef}
            scene={scene}
            width={size.width}
            height={size.height}
            playbackTime={playbackTime}
            pulseTime={pulseTime}
        />
    );
};

// ─── Main button + dialog ─────────────────────────────────────────────────────

export const VideoExportButton: React.FC<PropsWithChildren> = ({ children }) => {
    const classes = useStyles();
    const { scene } = useScene();
    const playback = useOptionalPlayback();

    const [open, setOpen] = useState(false);
    const [speed, setSpeed] = useState(DEFAULT_OPTIONS.speed);
    const [pixelRatio, setPixelRatio] = useState(DEFAULT_OPTIONS.pixelRatio);
    const [framerate, setFramerate] = useState(DEFAULT_OPTIONS.framerate);
    const [exporting, setExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [notifyWhenDone, setNotifyWhenDone] = useState(false);
    const cancelRef = useRef(false);
    const exportStartRef = useRef(0);

    const { source } = useScene();
    const disabled = scene.steps.length < 2 || !playback;
    const maxStep = scene.steps.length - 1;
    const totalFrames = disabled ? 0 : totalFrameCount(maxStep, speed, framerate);
    const totalSecs = totalFrames / framerate;

    const supportsNotifications = 'Notification' in window;
    const notificationsBlocked = supportsNotifications && Notification.permission === 'denied';

    const handleNotifyToggle = async () => {
        if (notifyWhenDone) {
            setNotifyWhenDone(false);
            return;
        }
        if (Notification.permission === 'granted') {
            setNotifyWhenDone(true);
            return;
        }
        const result = await Notification.requestPermission();
        if (result === 'granted') {
            setNotifyWhenDone(true);
        }
        // 'denied' → Notification.permission is now 'denied', button shows as disabled
        // 'default' → user dismissed Chrome's quiet chip, permission unchanged, button stays enabled
    };

    const handleExport = () => {
        cancelRef.current = false;
        exportStartRef.current = Date.now();
        setProgress(0);
        setNotifyWhenDone(false);
        setExporting(true);
    };

    const handleCancel = () => {
        cancelRef.current = true;
        setExporting(false);
        setProgress(0);
    };

    const handleComplete = (blob: Blob) => {
        const baseName = source?.name
            ? source.name.replace(/\.[^.]+$/, '') // strip file extension
            : 'animation';
        const fileName = `${baseName}_${framerate}fps_x${speed}_r${pixelRatio}.webm`;
        downloadBlob(blob, fileName);
        setExporting(false);
        setProgress(0);
        setOpen(false);
        if (notifyWhenDone && Notification.permission === 'granted') {
            const elapsed = Math.round((Date.now() - exportStartRef.current) / 1000);
            const mins = Math.floor(elapsed / 60);
            const secs = elapsed % 60;
            const duration = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
            new Notification('Export complete', { body: `${baseName}.webm is ready · ${duration}` });
        }
    };

    const handleError = (err: unknown) => {
        console.error('Video export failed:', err);
        setExporting(false);
        setProgress(0);
    };

    return (
        <>
            <CollapsableToolbarButton icon={<VideoRegular />} onClick={() => setOpen(true)} disabled={disabled}>
                {children}
            </CollapsableToolbarButton>

            <Dialog
                open={open}
                onOpenChange={(_, d) => {
                    if (!exporting) setOpen(d.open);
                }}
            >
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
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                                <Field label="Resolution" className={classes.optionField}>
                                    <Select
                                        value={pixelRatio.toString()}
                                        onChange={(_, d) => setPixelRatio(parseFloat(d.value))}
                                        disabled={exporting}
                                        size="small"
                                    >
                                        {RESOLUTION_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                                <Field label="Framerate" className={classes.optionField}>
                                    <Select
                                        value={framerate.toString()}
                                        onChange={(_, d) => setFramerate(parseInt(d.value))}
                                        disabled={exporting}
                                        size="small"
                                    >
                                        {FRAMERATE_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                            </div>

                            {!exporting && (
                                <Label className={classes.note}>
                                    {totalFrames} frames · {totalSecs.toFixed(1)}s · {framerate} FPS · WebM (VP9)
                                </Label>
                            )}

                            {exporting && (
                                <div className={classes.progressSection}>
                                    <div className={classes.progressHeader}>
                                        {progress < 1 ? (
                                            <>
                                                <Label>Rendering…</Label>
                                                <Label className={classes.progressPct}>
                                                    {Math.round(progress * 100)}%
                                                </Label>
                                            </>
                                        ) : (
                                            <Label>Finalizing…</Label>
                                        )}
                                    </div>
                                    <div className={classes.progressBar}>
                                        <div
                                            className={classes.progressBarFill}
                                            style={{ width: `${progress * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </DialogContent>

                        <DialogActions className={exporting ? classes.actionsExporting : undefined}>
                            {exporting ? (
                                <>
                                    {supportsNotifications &&
                                        (notificationsBlocked ? (
                                            <Button
                                                appearance="secondary"
                                                icon={<AlertOffRegular />}
                                                disabled
                                                title="Notifications are blocked by your browser"
                                            />
                                        ) : (
                                            <ToggleButton
                                                appearance="secondary"
                                                icon={notifyWhenDone ? <AlertFilled /> : <AlertRegular />}
                                                checked={notifyWhenDone}
                                                onClick={handleNotifyToggle}
                                                title={notifyWhenDone ? 'Cancel notification' : 'Notify me when done'}
                                            />
                                        ))}
                                    <Button appearance="secondary" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button appearance="secondary" onClick={() => setOpen(false)}>
                                        Close
                                    </Button>
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
                            framerate={framerate}
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
    progressBar: {
        height: '4px',
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusCircular,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: tokens.colorCompoundBrandBackground,
        borderRadius: tokens.borderRadiusCircular,
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
    actionsExporting: {
        justifyContent: 'space-between',
    },
    hidden: {
        position: 'fixed',
        left: '-9999px',
        top: '-9999px',
        visibility: 'hidden',
        pointerEvents: 'none',
    },
});
