import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  X,
  Maximize,
  Minimize,
} from 'lucide-react';
import type { StoryboardSlide } from '@/types/recipe';

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Milliseconds each caption is displayed during autoplay. */
const SLIDE_DURATION_MS = 4000;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface RecipeStoryboardProps {
  /** Recipe title — displayed in the header. */
  title: string;
  /** Single recipe image — displayed behind every slide. */
  image: string;
  /** Slides from the backend, one per instruction step. No per-slide images. */
  slides: StoryboardSlide[];
  /** Called when the user closes the modal. */
  onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export const RecipeStoryboard = ({ title, image, slides, onClose }: RecipeStoryboardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying,    setIsPlaying]    = useState(true);
  const [isEnded,      setIsEnded]      = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captionKey,   setCaptionKey]   = useState(0); // bumped on slide change to re-trigger CSS animation
  const [progress,     setProgress]     = useState(0);

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides  = slides.length;
  const currentSlide = slides[currentIndex];

  // ─── Timer helpers ────────────────────────────────────────────────────────

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    intervalRef.current = null;
    progressRef.current = null;
  }, []);

  // ─── Navigation ───────────────────────────────────────────────────────────

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= totalSlides) return;
    setCurrentIndex(index);
    setProgress(0);
    // Bump key so the caption CSS fade-in re-fires even if the text changes
    // but the index stays the same (restart case)
    setCaptionKey((k) => k + 1);
  }, [totalSlides]);

  const goNext = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      goTo(currentIndex + 1);
    } else {
      clearTimers();
      setIsPlaying(false);
      setIsEnded(true);
    }
  }, [currentIndex, totalSlides, goTo, clearTimers]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsEnded(false);
      goTo(currentIndex - 1);
    }
  }, [currentIndex, goTo]);

  const restart = useCallback(() => {
    clearTimers();
    setIsEnded(false);
    setIsPlaying(true);
    goTo(0);
  }, [clearTimers, goTo]);

  // ─── Autoplay engine ──────────────────────────────────────────────────────
  // intervalRef  — advances caption every SLIDE_DURATION_MS
  // progressRef  — updates progress bar every 50 ms (smooth fill)

  useEffect(() => {
    clearTimers();
    if (!isPlaying || isEnded) return;

    const tick     = 50;
    const step     = (tick / SLIDE_DURATION_MS) * 100;

    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + step, 100));
    }, tick);

    intervalRef.current = setInterval(() => {
      goNext();
    }, SLIDE_DURATION_MS);

    return () => clearTimers();
  }, [isPlaying, isEnded, currentIndex, goNext, clearTimers]);

  // Reset progress bar on slide change
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // ─── Play / Pause toggle ──────────────────────────────────────────────────

  const togglePlay = () => {
    if (isEnded) {
      restart();
    } else {
      setIsPlaying((p) => !p);
    }
  };

  // ─── Fullscreen API ───────────────────────────────────────────────────────

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Blocked in some browsers/iframes — fail silently
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight': case 'l': goNext();                         break;
        case 'ArrowLeft':  case 'j': goPrev();                         break;
        case ' ':          e.preventDefault(); togglePlay();           break;
        case 'Escape':     if (!document.fullscreenElement) onClose(); break;
        case 'r':          restart();                                  break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goNext, goPrev, restart, onClose]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearTimers();
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [clearTimers]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal container — fullscreen target */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex flex-col bg-black select-none"
      >

        {/* ── Segmented progress bar ─────────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-0.5 px-1 pt-1">
          {slides.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden cursor-pointer"
              onClick={() => { setIsEnded(false); setIsPlaying(true); goTo(i); }}
              title={`Step ${i + 1}`}
            >
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 pt-5 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex flex-col">
            <h2 className="text-white font-bold text-base md:text-lg leading-tight line-clamp-1">
              🎬 {title}
            </h2>
            <p className="text-white/60 text-xs mt-0.5">
              Step {currentSlide.step} of {totalSlides}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon" variant="ghost"
              className="text-white hover:bg-white/20 h-9 w-9"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button
              size="icon" variant="ghost"
              className="text-white hover:bg-white/20 h-9 w-9"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* ── Recipe image — single image, never swapped ────────────────── */}
        <div className="relative flex-1 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            // A single <img> that stays mounted for the entire storyboard.
            // The browser only makes one network request.
          />

          {/* Persistent bottom gradient for caption legibility */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />

          {/* ── Caption block — only this animates on slide change ────────── */}
          {/*
            captionKey is bumped on every goTo() call.
            The CSS class 'animate-fade-in' (already used elsewhere in the
            project) re-triggers because React replaces the DOM node when
            the key changes, restarting the animation from the top.
          */}
          <div
            key={captionKey}
            className="absolute inset-x-0 bottom-28 md:bottom-24 px-6 md:px-12 text-white animate-fade-in"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
              Step {currentSlide.step} of {totalSlides}
            </p>
            <p className="text-base md:text-xl font-medium leading-snug drop-shadow-lg max-w-3xl">
              "{currentSlide.instruction}"
            </p>
          </div>

          {/* ── Prev / Next tap zones (stories UX) ───────────────────────── */}
          <button
            className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-pointer"
            onClick={goPrev}
            disabled={currentIndex === 0}
            aria-label="Previous step"
          />
          <button
            className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-pointer"
            onClick={goNext}
            aria-label="Next step"
          />
        </div>

        {/* ── Bottom control bar ────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 py-4 px-4 bg-black/80 backdrop-blur-sm">
          <Button
            size="icon" variant="ghost"
            className="text-white hover:bg-white/20 h-10 w-10"
            onClick={restart}
            title="Restart (R)"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            size="icon" variant="ghost"
            className="text-white hover:bg-white/20 h-10 w-10"
            onClick={goPrev}
            disabled={currentIndex === 0}
            title="Previous (←)"
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            size="icon" variant="ghost"
            className="text-white hover:bg-white/20 h-14 w-14 rounded-full border border-white/30"
            onClick={togglePlay}
            title={isEnded ? 'Replay' : isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isEnded ? (
              <RotateCcw className="h-6 w-6" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 translate-x-0.5" />
            )}
          </Button>

          <Button
            size="icon" variant="ghost"
            className="text-white hover:bg-white/20 h-10 w-10"
            onClick={goNext}
            disabled={currentIndex === totalSlides - 1 && isEnded}
            title="Next (→)"
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          <span className="text-white/60 text-sm min-w-[3.5rem] text-center">
            {currentIndex + 1} / {totalSlides}
          </span>
        </div>

        {/* ── End-of-storyboard overlay ─────────────────────────────────── */}
        {isEnded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-30">
            <p className="text-white text-2xl font-bold mb-2">🍽️ Enjoy your meal!</p>
            <p className="text-white/60 text-sm mb-6">Storyboard complete</p>
            <div className="flex gap-3">
              <Button
                onClick={restart}
                className="bg-white text-black hover:bg-white/90"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Watch Again
              </Button>
              <Button
                variant="outline"
                className="text-white border-white/40 hover:bg-white/10"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
