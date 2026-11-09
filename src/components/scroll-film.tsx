"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FRAME_COUNT,
  FRAME_FPS,
  SCRUB_LEAD,
  beatIndex,
  frameUrl,
  progressToTime,
} from "@/lib/film";
import { type FilmSpec } from "@/lib/site";

type Visual = "still" | "video" | "frames" | "error";
type Mode = "scroll" | "playing" | "reduced";

type Seeker = {
  seek: (time: number) => void;
  failed: () => boolean;
  destroy: () => void;
};

function createSeeker(
  video: HTMLVideoElement,
  hooks: { onFail: () => void; onSuccess: () => void },
): Seeker {
  let pending: number | null = null;
  let busy = false;
  let failures = 0;
  let dead = false;
  let timer = 0;
  let target = 0;

  const settle = () => {
    window.clearTimeout(timer);
    busy = false;
    if (dead) return;
    if (Math.abs(video.currentTime - target) > 0.5) {
      failures += 1;
      if (failures >= 2) {
        dead = true;
        hooks.onFail();
        return;
      }
    } else {
      failures = 0;
      hooks.onSuccess();
    }
    if (pending != null) {
      const next = pending;
      pending = null;
      seek(next);
    }
  };

  const seek = (time: number) => {
    if (dead) return;
    if (!Number.isFinite(video.duration) || video.readyState < 1) {
      pending = time;
      return;
    }
    if (busy) {
      pending = time;
      return;
    }
    if (Math.abs(video.currentTime - time) < 0.045) {
      hooks.onSuccess();
      return;
    }
    busy = true;
    target = time;
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      settle();
    };
    video.addEventListener("seeked", onSeeked);
    timer = window.setTimeout(() => {
      video.removeEventListener("seeked", onSeeked);
      settle();
    }, 800);
    try {
      video.currentTime = time;
    } catch {
      video.removeEventListener("seeked", onSeeked);
      dead = true;
      busy = false;
      hooks.onFail();
    }
  };

  return {
    seek,
    failed: () => dead,
    destroy() {
      dead = true;
      window.clearTimeout(timer);
    },
  };
}

function preloadFrames(base: string) {
  for (let number = 1; number <= FRAME_COUNT; number += 1) {
    const image = new Image();
    image.src = `${base}${String(number).padStart(2, "0")}.webp`;
  }
}

function reducedMotionNow() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The cleaning route as a scrubber actually works: parallel passes back and forth
 * across the floor, converging toward the hall's vanishing point. Solid where the
 * near floor has been covered, dashed where the route continues up the hall.
 * Drawn over the film because the baked-in line is a single wandering curve.
 *
 * The viewBox matches the film's 16/9 frame, and the geometry is tuned to the
 * hall's perspective: passes narrow and close up as they recede.
 */
function SweepRoute() {
  // The viewBox is 100 x 56.25, so a height percentage of the frame maps to
  // pct * 0.5625 here. Measured from the footage: the tile starts at ~43% height
  // (y 24.2) where the hall's far end meets the floor, and from ~65% down it
  // spans the full frame width. The nearest pass is carried past the bottom edge
  // so the sweep reads as floor continuing toward the viewer, not a mat on it.
  const VANISH_X = 46;
  const VANISH_Y = 27.5;
  const NEAR_Y = 62;
  const NEAR_HALF = 118;
  // depth 0 = nearest pass, 1 = the far end of the covered floor.
  const lane = (depth: number) => {
    // Space the passes evenly down the screen so they read as regular coverage,
    // then derive width from that row's height: a true vanishing-point taper,
    // with no bunching near the horizon.
    const y = NEAR_Y - (NEAR_Y - VANISH_Y) * depth;
    const k = (y - VANISH_Y) / (NEAR_Y - VANISH_Y);
    return {
      y,
      left: VANISH_X - NEAR_HALF * k,
      right: VANISH_X + NEAR_HALF * k,
    };
  };
  const solid: string[] = [];
  const PASSES = 6;
  // Solid covers the near floor; the rest of the hall is projected, not yet done.
  const COVERED = 0.55;
  for (let i = 0; i < PASSES; i += 1) {
    const a = lane((i / PASSES) * COVERED);
    const b = lane(((i + 1) / PASSES) * COVERED);
    const leftToRight = i % 2 === 0;
    const from = leftToRight ? a.left : a.right;
    const to = leftToRight ? a.right : a.left;
    const turn = leftToRight ? b.right : b.left;
    solid.push(`M ${from} ${a.y} L ${to} ${a.y}`);
    // Rounded turn onto the next pass, the way a scrubber comes about.
    solid.push(
      `M ${to} ${a.y} Q ${to + (leftToRight ? 2.2 : -2.2)} ${(a.y + b.y) / 2} ${turn} ${b.y}`,
    );
  }
  // Dashed: the same sweep continuing up the hall, to the end of the scene.
  const dashedParts: string[] = [];
  const DASH_PASSES = 5;
  for (let i = 0; i < DASH_PASSES; i += 1) {
    const t0 = COVERED + ((1 - COVERED) * i) / DASH_PASSES;
    const t1 = COVERED + ((1 - COVERED) * (i + 1)) / DASH_PASSES;
    const a = lane(t0);
    const b = lane(t1);
    const leftToRight = (PASSES + i) % 2 === 0;
    const from = leftToRight ? a.left : a.right;
    const to = leftToRight ? a.right : a.left;
    const turn = leftToRight ? b.right : b.left;
    dashedParts.push(`M ${from} ${a.y} L ${to} ${a.y}`);
    dashedParts.push(`M ${to} ${a.y} L ${turn} ${b.y}`);
  }
  return (
    <svg
      className="sweep-route"
      viewBox="0 0 100 56.25"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* The scrubber is baked into the footage, so the route is masked out
            where its body sits (measured at x 21-40%, y 45-75% of the frame).
            Lines then pass behind the machine instead of across it. */}
        <mask id="sweep-occluder" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="56.25">
          <rect x="0" y="0" width="100" height="56.25" fill="#fff" />
          <ellipse cx="30.5" cy="37.2" rx="10.4" ry="7.4" fill="#000" />
          <ellipse cx="30.5" cy="41.6" rx="11.2" ry="2.6" fill="#000" />
        </mask>
      </defs>
      <g mask="url(#sweep-occluder)">
        <g className="sweep-solid">
          {solid.map((d, i) => (
            <path key={`s${i}`} d={d} />
          ))}
        </g>
        <g className="sweep-dashed">
          {dashedParts.map((d, i) => (
            <path key={`d${i}`} d={d} />
          ))}
        </g>
      </g>
    </svg>
  );
}

export function ScrollFilm({ film }: { film: FilmSpec }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLImageElement>(null);
  const modeRef = useRef<Mode>("scroll");
  const visualRef = useRef<Visual>("still");
  const reducedRef = useRef(false);
  const holdRef = useRef(false);
  const holdAtRef = useRef(0);
  const seekerRef = useRef<Seeker | null>(null);

  const [beat, setBeat] = useState(0);
  const [mode, setMode] = useState<Mode>("scroll");
  const [visual, setVisual] = useState<Visual>("still");
  const [canPlay, setCanPlay] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    visualRef.current = visual;
  }, [visual]);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const reduce = reducedMotionNow();
    reducedRef.current = reduce;
    if (reduce) {
      document.documentElement.classList.add("reduce-motion");
      document.documentElement.dataset.motion = "reduce";
      modeRef.current = "reduced";
      section.dataset.mode = "reduced";
    }

    const forceFrames = new URLSearchParams(window.location.search).get("film") === "frames";
    let disposed = false;

    const showFrames = () => {
      if (disposed) return;
      visualRef.current = "frames";
      setVisual("frames");
      setMessage(
        "Scroll is using stills from the film. Seeking was not reliable in this browser. Play and Replay run the video.",
      );
      preloadFrames(film.frames);
    };

    const seeker = createSeeker(video, {
      onFail: showFrames,
      onSuccess: () => {
        if (disposed || reducedRef.current || visualRef.current === "frames") return;
        // currentTime near 0 has no picture yet, so the daylight poster would show.
        if (video.currentTime < SCRUB_LEAD - 0.04) return;
        if (visualRef.current !== "video") {
          visualRef.current = "video";
          setVisual("video");
        }
      },
    });
    seekerRef.current = seeker;

    if (forceFrames) showFrames();

    const onReady = () => {
      if (!disposed) setCanPlay(true);
    };
    const onError = () => {
      if (disposed || !video.error || video.error.code === 1) return;
      visualRef.current = "error";
      setVisual("error");
      setCanPlay(false);
      setMessage("The film file did not load. The still on screen is the concept visual.");
    };
    const onEnded = () => {
      modeRef.current = reducedRef.current ? "reduced" : "scroll";
      setMode(modeRef.current);
    };
    const onTime = () => {
      if (modeRef.current !== "playing" || !section) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      const progress = Math.min(1, video.currentTime / duration);
      section.style.setProperty("--p", progress.toFixed(4));
      section.dataset.progress = progress.toFixed(3);
      section.dataset.time = video.currentTime.toFixed(2);
      const next = beatIndex(progress);
      setBeat((current) => (current === next ? current : next));
    };

    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("canplay", onReady);
    if (video.readyState >= 1) onReady();
    video.addEventListener("error", onError);
    video.addEventListener("ended", onEnded);
    video.addEventListener("timeupdate", onTime);

    let raf = 0;
    const applyScroll = () => {
      if (disposed || reducedRef.current || modeRef.current === "playing") return;
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / scrollable));
      if (holdRef.current && Math.abs(progress - holdAtRef.current) < 0.012) return;
      holdRef.current = false;
      section.style.setProperty("--p", progress.toFixed(4));
      section.dataset.progress = progress.toFixed(3);
      const duration = Number.isFinite(video.duration) ? video.duration : 6.92;
      const time = progressToTime(progress, duration);
      section.dataset.time = time.toFixed(2);
      section.dataset.mode = modeRef.current;
      section.dataset.visual = visualRef.current;
      const next = beatIndex(progress);
      setBeat((current) => (current === next ? current : next));

      if (visualRef.current === "error") return;
      if (seeker.failed() || visualRef.current === "frames" || forceFrames) {
        const frame = frameRef.current;
        if (frame) {
          const url = frameUrl(film.frames, time, FRAME_FPS, FRAME_COUNT);
          if (!frame.src.endsWith(url)) frame.src = url;
        }
        return;
      }
      seeker.seek(time);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyScroll);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting && modeRef.current === "playing") {
          video.pause();
          modeRef.current = reducedRef.current ? "reduced" : "scroll";
          setMode(modeRef.current);
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(section);

    const flushSeek = () => {
      if (!disposed) applyScroll();
    };
    video.addEventListener("loadeddata", flushSeek);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      seeker.destroy();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onError);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadeddata", flushSeek);
      video.controls = false;
    };
  }, [film.frames]);

  const jumpToBeat = (index: number) => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const points = [0.08, 0.46, 0.84];
    const progress = points[index] ?? 0;
    if (reducedRef.current) {
      const duration = video && Number.isFinite(video.duration) ? video.duration : 6.92;
      const time = progressToTime(progress, duration);
      if (frameRef.current) frameRef.current.src = frameUrl(film.frames, time);
      if (!seekerRef.current?.failed()) seekerRef.current?.seek(time);
      if (section) {
        section.style.setProperty("--p", progress.toFixed(4));
        section.dataset.progress = progress.toFixed(3);
        section.dataset.time = time.toFixed(2);
      }
      setBeat(index);
      if (visualRef.current !== "error") {
        visualRef.current = seekerRef.current?.failed() ? "frames" : "video";
        setVisual(visualRef.current);
      }
      return;
    }
    if (!section) return;
    const scrollable = section.offsetHeight - window.innerHeight;
    const top = window.scrollY + section.getBoundingClientRect().top;
    window.scrollTo({
      top: top + progress * scrollable,
      behavior: "smooth",
    });
  };

  const onPlay = async () => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video) return;
    if (modeRef.current === "playing") {
      video.pause();
      modeRef.current = reducedRef.current ? "reduced" : "scroll";
      setMode(modeRef.current);
      holdRef.current = true;
      holdAtRef.current = Number(section?.dataset.progress ?? 0);
      return;
    }
    if (
      video.ended ||
      video.currentTime < SCRUB_LEAD ||
      (video.duration && video.currentTime > video.duration - 0.08)
    ) {
      try {
        video.currentTime = SCRUB_LEAD;
      } catch {
        /* Replay falls through to play(); the stills remain if seeking throws. */
      }
    }
    modeRef.current = "playing";
    setMode("playing");
    visualRef.current = "video";
    setVisual("video");
    try {
      await video.play();
    } catch {
      setMessage("Playback did not start. The still remains available.");
      modeRef.current = reducedRef.current ? "reduced" : "scroll";
      setMode(modeRef.current);
      if (reducedRef.current) {
        visualRef.current = "still";
        setVisual("still");
      }
    }
  };

  const onReplay = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      video.pause();
      video.currentTime = SCRUB_LEAD;
    } catch {
      setMessage("Replay could not move the film back to the route. The still remains available.");
      return;
    }
    modeRef.current = "playing";
    setMode("playing");
    visualRef.current = "video";
    setVisual("video");
    try {
      await video.play();
    } catch {
      setMessage("Replay did not start. The still remains available.");
      modeRef.current = reducedRef.current ? "reduced" : "scroll";
      setMode(modeRef.current);
    }
  };

  const stageClass = [
    "film-stage",
    visual === "video" ? "is-video" : "",
    visual === "frames" ? "is-frames" : "",
    visual === "error" ? "is-error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      ref={sectionRef}
      id={film.id}
      className="film"
      data-testid={`film-${film.id}`}
      data-mode={mode}
      data-visual={visual}
      aria-labelledby={`${film.id}-title`}
    >
      <div className="film-sticky">
        <div className="film-copy">
          <div>
            <p className="kicker">{film.kicker}</p>
            <h2 id={`${film.id}-title`}>{film.title}</h2>
          </div>
          <div>
            <div className="beat-nav" role="group" aria-label="Moments in this film">
              {film.beats.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={index === beat ? "is-active" : undefined}
                  aria-pressed={index === beat}
                  onClick={() => jumpToBeat(index)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="meter" aria-hidden="true">
              <span />
            </div>
            <div className="beats">
              {film.beats.map((item, index) => (
                <div key={item.id} className={index === beat ? "beat is-active" : "beat"}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
            <div className="film-controls">
              <Button
                type="button"
                className="film-button"
                data-testid={`play-${film.id}`}
                onClick={onPlay}
                disabled={!canPlay || visual === "error"}
              >
                {mode === "playing" ? "Pause" : "Play"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="film-button"
                data-testid={`replay-${film.id}`}
                onClick={onReplay}
                disabled={!canPlay || visual === "error"}
              >
                Replay
              </Button>
            </div>
            {mode === "playing" ? (
              <p className="scroll-hint">Playing. Pause to return the film to the scroll.</p>
            ) : (
              <>
                <p className="scroll-hint motion-only">Scroll to move through the film.</p>
                <p className="scroll-hint reduce-only">
                  Reduced motion is on. Play runs the film. The moments above stay on the page.
                </p>
              </>
            )}
            {message ? (
              <p className="film-status" role="status">
                {message}
              </p>
            ) : null}
            <p className="film-note" id={`${film.id}-note`}>
              {film.note}
            </p>
          </div>
        </div>
        <div className={stageClass} data-beat={beat}>
          <div className="film-frame">
          {/* Plain img elements so scroll can swap frame files without a loader round-trip. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="film-still overlay-route"
            src={`${film.frames}01.webp`}
            alt={film.routeAlt}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="film-still overlay-poster" src={film.poster} alt={film.posterAlt} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={frameRef}
            className="film-still overlay-frame"
            src={`${film.frames}01.webp`}
            alt={film.posterAlt}
          />
          {film.sweep ? <SweepRoute /> : null}
          <video
            ref={videoRef}
            className="film-video"
            src={film.src}
            poster={`${film.frames}01.webp`}
            muted
            playsInline
            preload="metadata"
            aria-label={film.videoLabel}
            aria-describedby={`${film.id}-note`}
          >
            <track
              kind="captions"
              src={film.captions}
              srcLang="en"
              label="English descriptions"
            />
          </video>
          <p className="concept-tag">Concept visual</p>
          </div>
        </div>
        <noscript>
          <video
            className="noscript-film"
            src={film.src}
            poster={film.poster}
            controls
            muted
            playsInline
            preload="metadata"
          />
        </noscript>
      </div>
    </section>
  );
}
