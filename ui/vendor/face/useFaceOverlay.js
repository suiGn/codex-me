import { drawFaceMesh } from '../../face-mesh.js';
// Vendored this.gui FaceRecognition hook; see PROVENANCE.json and LICENSE.
const React = window.React;
// Lightweight subset of MediaPipe FaceMesh connections (contours)
function detectPlaceholderLandmarksFromVideo(video) {
    if (!video.videoWidth || !video.videoHeight)
        return null;
    // Simple normalized points roughly for eyes, nose, mouth
    const points = [
        { x: 0.35, y: 0.4 },
        { x: 0.65, y: 0.4 },
        { x: 0.5, y: 0.5 },
        { x: 0.4, y: 0.6 },
        { x: 0.6, y: 0.6 },
        { x: 0.3, y: 0.5 },
        { x: 0.7, y: 0.5 },
        { x: 0.5, y: 0.3 },
        { x: 0.45, y: 0.45 },
        { x: 0.55, y: 0.45 },
        { x: 0.5, y: 0.7 },
    ];
    return { points };
}
/**
 * useFaceOverlay
 *
 * Owns the requestAnimationFrame loop that:
 * - keeps canvas resolution in sync
 * - runs MediaPipe detectForVideo (throttled)
 * - draws mesh points + optional contour connections
 * - publishes latest points/blendshapes/hud anchor
 */
export function useFaceOverlay(args) {
    const { enabled, canvasRef, getVideoEl, faceLandmarker, faceLandmarkerLoading = false, faceLandmarkerError = false, variant = 'modal', mirrorPreview = true, showMeshConnections, meshStep = 1, detectThrottleMs = 80, 
    // Smoother defaults: keep face “locked” longer to avoid flicker on brief misses.
    noFaceMissesToClear = 24, noFaceGraceMs = 1500, minFaceHoldMs = 1200, onHasFaceChange, onPoints, onBlendshapes, onHudAnchor, } = args;
    const rafRef = React.useRef(null);
    const lastDetectTimeRef = React.useRef(0);
    const lastFaceSeenAtRef = React.useRef(0);
    const missCountRef = React.useRef(0);
    const lastLogAtRef = React.useRef(0);
    const lastFaceMarkedAtRef = React.useRef(0);
    const lastRealPointsRef = React.useRef(null);
    const lastBlendshapesRef = React.useRef(null);
    const lastHudAnchorRef = React.useRef(null);
    const [hasFace, setHasFace] = React.useState(false);
    // Keep callbacks stable without re-wiring the RAF loop every render.
    const callbacksRef = React.useRef({ onHasFaceChange, onPoints, onBlendshapes, onHudAnchor });
    React.useEffect(() => {
        callbacksRef.current = { onHasFaceChange, onPoints, onBlendshapes, onHudAnchor };
    }, [onHasFaceChange, onPoints, onBlendshapes, onHudAnchor]);
    const setHasFaceSafe = React.useCallback((next, force) => {
        setHasFace((prev) => {
            // Min-hold: if we already have a face, don't drop it immediately unless forced.
            if (!next && prev && !force) {
                const now = performance.now();
                const heldFor = now - lastFaceMarkedAtRef.current;
                if (heldFor < Number(minFaceHoldMs ?? 0)) {
                    return prev;
                }
            }
            if (prev !== next)
                callbacksRef.current.onHasFaceChange?.(next);
            if (next)
                lastFaceMarkedAtRef.current = performance.now();
            return next;
        });
    }, [minFaceHoldMs]);
    React.useEffect(() => {
        if (!enabled) {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            setHasFaceSafe(false, true);
            lastFaceSeenAtRef.current = 0;
            missCountRef.current = 0;
            lastLogAtRef.current = 0;
            lastRealPointsRef.current = null;
            lastBlendshapesRef.current = null;
            lastHudAnchorRef.current = null;
            callbacksRef.current.onPoints?.(null);
            callbacksRef.current.onBlendshapes?.(null);
            callbacksRef.current.onHudAnchor?.(null);
            return;
        }
        const canvasEl = canvasRef.current;
        if (!canvasEl)
            return;
        let cancelled = false;
        async function draw() {
            if (cancelled)
                return;
            const canvasNow = canvasRef.current;
            if (!canvasNow)
                return;
            const videoNow = getVideoEl();
            // Sync canvas backing store size with CSS size for sharpness
            const rect = canvasNow.getBoundingClientRect();
            if (rect.width && rect.height && (canvasNow.width !== rect.width || canvasNow.height !== rect.height)) {
                canvasNow.width = rect.width;
                canvasNow.height = rect.height;
            }
            const ctx = canvasNow.getContext('2d');
            if (!ctx) {
                rafRef.current = requestAnimationFrame(draw);
                return;
            }
            ctx.clearRect(0, 0, canvasNow.width, canvasNow.height);
            const vw = videoNow?.videoWidth ?? 0;
            const vh = videoNow?.videoHeight ?? 0;
            const readyState = videoNow?.readyState ?? 0;
            const videoIsReady = !!videoNow && vw > 0 && vh > 0 && readyState >= 2;
            if (!videoIsReady) {
                rafRef.current = requestAnimationFrame(draw);
                return;
            }
            if (!videoNow || faceLandmarkerLoading) {
                rafRef.current = requestAnimationFrame(draw);
                return;
            }
            // --- Detection (throttled) ---
            const now = performance.now();
            const elapsed = now - lastDetectTimeRef.current;
            const throttleMs = Math.max(16, Number(detectThrottleMs ?? 80));
            if (!faceLandmarkerError && faceLandmarker && elapsed > throttleMs) {
                lastDetectTimeRef.current = now;
                try {
                    const mpResult = faceLandmarker.detectForVideo(videoNow, now);
                    const has = !!(mpResult && mpResult.faceLandmarks && mpResult.faceLandmarks.length > 0);
                    if (has) {
                        missCountRef.current = 0;
                        lastFaceSeenAtRef.current = now;
                        lastFaceMarkedAtRef.current = now;
                        const rawPoints = mpResult.faceLandmarks[0];
                        const points = rawPoints.map((p) => ({ x: p.x, y: p.y }));
                        lastRealPointsRef.current = points;
                        const forehead = points[10] || points[9] || points[8] || { x: 0.5, y: 0.12 };
                        lastHudAnchorRef.current = { x: forehead.x, y: forehead.y };
                        const bs = mpResult?.faceBlendshapes?.[0]?.categories;
                        if (Array.isArray(bs) && bs.length) {
                            lastBlendshapesRef.current = bs.map((c) => ({
                                categoryName: String(c.categoryName ?? ''),
                                score: Number(c.score ?? 0),
                            }));
                        }
                        else {
                            lastBlendshapesRef.current = null;
                        }
                        setHasFaceSafe(true);
                        callbacksRef.current.onPoints?.(points);
                        callbacksRef.current.onBlendshapes?.(lastBlendshapesRef.current);
                        callbacksRef.current.onHudAnchor?.(lastHudAnchorRef.current);
                    }
                    else {
                        // Hysteresis: don't drop face immediately on a single miss.
                        missCountRef.current += 1;
                        const lastSeen = lastFaceSeenAtRef.current || 0;
                        const withinGrace = lastSeen > 0 && (now - lastSeen) < Number(noFaceGraceMs ?? 450);
                        const missesNeeded = Math.max(1, Number(noFaceMissesToClear ?? 6));
                        if (!withinGrace && missCountRef.current >= missesNeeded) {
                            setHasFaceSafe(false);
                            lastRealPointsRef.current = null;
                            lastBlendshapesRef.current = null;
                            lastHudAnchorRef.current = null;
                            callbacksRef.current.onPoints?.(null);
                            callbacksRef.current.onBlendshapes?.(null);
                            callbacksRef.current.onHudAnchor?.(null);
                        }
                    }
                }
                catch (err) {
                    // If detect fails intermittently, keep last points for a grace window.
                    missCountRef.current += 1;
                    const lastSeen = lastFaceSeenAtRef.current || 0;
                    const withinGrace = lastSeen > 0 && (now - lastSeen) < Number(noFaceGraceMs ?? 450);
                    const missesNeeded = Math.max(1, Number(noFaceMissesToClear ?? 6));
                    // Lightweight debug log (at most 1/sec)
                    if (now - lastLogAtRef.current > 1000) {
                        lastLogAtRef.current = now;
                        // eslint-disable-next-line no-console
                        console.warn('[useFaceOverlay] detectForVideo failed:', err?.message || err);
                    }
                    if (!withinGrace && missCountRef.current >= missesNeeded) {
                        setHasFaceSafe(false);
                        lastRealPointsRef.current = null;
                        lastBlendshapesRef.current = null;
                        lastHudAnchorRef.current = null;
                        callbacksRef.current.onPoints?.(null);
                        callbacksRef.current.onBlendshapes?.(null);
                        callbacksRef.current.onHudAnchor?.(null);
                    }
                }
            }
            // --- Choose points to draw ---
            let pointsToDraw = null;
            if (faceLandmarkerError || !faceLandmarker) {
                pointsToDraw = detectPlaceholderLandmarksFromVideo(videoNow)?.points ?? null;
            }
            else {
                pointsToDraw = lastRealPointsRef.current;
            }
            if (pointsToDraw && canvasNow.dataset.previewVisible !== 'false') {
                drawFaceMesh(canvasNow, { points: pointsToDraw, aspect: vw / vh, mirror: mirrorPreview,
                    fit: variant === 'inline' ? 'cover' : 'contain', meshStep, connections: showMeshConnections });
            }
            rafRef.current = requestAnimationFrame(draw);
        }
        rafRef.current = requestAnimationFrame(draw);
        return () => {
            cancelled = true;
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            setHasFaceSafe(false);
            lastFaceSeenAtRef.current = 0;
            missCountRef.current = 0;
            lastLogAtRef.current = 0;
            lastRealPointsRef.current = null;
            lastBlendshapesRef.current = null;
            lastHudAnchorRef.current = null;
            callbacksRef.current.onPoints?.(null);
            callbacksRef.current.onBlendshapes?.(null);
            callbacksRef.current.onHudAnchor?.(null);
        };
    }, [
        enabled,
        canvasRef,
        getVideoEl,
        faceLandmarker,
        faceLandmarkerLoading,
        faceLandmarkerError,
        variant,
        mirrorPreview,
        showMeshConnections,
        meshStep,
        detectThrottleMs,
        noFaceMissesToClear,
        noFaceGraceMs,
        setHasFaceSafe,
    ]);
    return {
        hasFace,
        lastPoints: lastRealPointsRef.current,
        lastBlendshapes: lastBlendshapesRef.current,
        hudAnchor: lastHudAnchorRef.current,
    };
}
export default useFaceOverlay;
