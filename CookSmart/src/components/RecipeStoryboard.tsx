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
  Check,
} from 'lucide-react';
import type { StoryboardSlide } from '@/types/recipe';

// ─── Constants ─────────────────────────────────────────────────────────────────

const SLIDE_DURATION_MS = 4000;

// ─── Ken Burns animation definitions ─────────────────────────────────────────
// 8 alternating cinematic movements — cycle through them per slide index so
// consecutive slides always feel visually different. The animation duration
// is set to SLIDE_DURATION_MS so the movement fills exactly one slide.
// Using inline <style> keeps this self-contained with zero new dependencies.

const KB_ANIMATIONS = [
  // name            keyframes
  ['kb-zoom-in',     'from{transform:scale(1.0) translate(0%,0%)} to{transform:scale(1.18) translate(0%,0%)}'],
  ['kb-zoom-out',    'from{transform:scale(1.18) translate(0%,0%)} to{transform:scale(1.0) translate(0%,0%)}'],
  ['kb-pan-right',   'from{transform:scale(1.12) translate(-3%,0%)} to{transform:scale(1.12) translate(3%,0%)}'],
  ['kb-pan-left',    'from{transform:scale(1.12) translate(3%,0%)} to{transform:scale(1.12) translate(-3%,0%)}'],
  ['kb-diag-tl-br',  'from{transform:scale(1.1) translate(-2%,-2%)} to{transform:scale(1.18) translate(2%,2%)}'],
  ['kb-diag-br-tl',  'from{transform:scale(1.18) translate(2%,2%)} to{transform:scale(1.1) translate(-2%,-2%)}'],
  ['kb-zoom-pan-r',  'from{transform:scale(1.0) translate(0%,0%)} to{transform:scale(1.15) translate(3%,-1%)}'],
  ['kb-zoom-pan-l',  'from{transform:scale(1.0) translate(0%,0%)} to{transform:scale(1.15) translate(-3%,-1%)}'],
] as const;

const KB_STYLE = KB_ANIMATIONS.map(
  ([name, kf]) => `@keyframes ${name}{${kf}}`
).join('\n');

// ─── Ingredient matching ───────────────────────────────────────────────────────
// Lightweight normaliser — strips quantities/units/punctuation, lowercases,
// returns core words. Used to detect which ingredients appear in each step.

const _normaliseIngWord = (raw: string): string[] => {
  let s = raw.toLowerCase();
  s = s.replace(/[\d]+[./][\d]+/g, '');
  s = s.replace(/[\d]+/g, '');
  s = s.replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g, '');
  s = s.replace(/\b(cups?|tbsps?|tsps?|tablespoons?|teaspoons?|grams?|kgs?|lbs?|ozs?|mls?|litres?|liters?|pieces?|slices?|cloves?|bunches?|heads?|stalks?|sprigs?)\b/g, '');
  s = s.replace(/\(.*?\)/g, '');
  s = s.replace(/[,.;:\-]/g, ' ');
  s = s.replace(/\b(finely|roughly|chopped|diced|sliced|minced|crushed|grated|peeled|fresh|dried|frozen|ground|whole|large|medium|small|boneless|skinless|optional|to|taste|and|or|of)\b/g, '');
  return s.replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 2);
};

const _singularise = (w: string): string => {
  if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.endsWith('oes')) return w.slice(0, -2);
  if (/(?:s|x|z|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && w.length > 4) return w.slice(0, -1);
  return w;
};

const _tokenise = (raw: string): Set<string> =>
  new Set(_normaliseIngWord(raw).map(_singularise));

// Returns true if any token from ingredient appears in the step text.
const _ingredientInStep = (ingredient: string, stepText: string): boolean => {
  const ingTokens = _tokenise(ingredient);
  const stepTokens = _tokenise(stepText);
  for (const t of ingTokens) {
    if (t.length > 2 && stepTokens.has(t)) return true;
  }
  return false;
};

// Build a Set of ingredient indices mentioned in a step instruction.
const _getStepIngredients = (instruction: string, ingredients: string[]): Set<number> => {
  const used = new Set<number>();
  ingredients.forEach((ing, idx) => {
    if (_ingredientInStep(ing, instruction)) used.add(idx);
  });
  return used;
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface RecipeStoryboardProps {
  title: string;
  image: string;
  /** Full ingredient list from the recipe — used for the tracker. */
  ingredients: string[];
  slides: StoryboardSlide[];
  onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export const RecipeStoryboard = ({
  title,
  image,
  ingredients,
  slides,
  onClose,
}: RecipeStoryboardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying,    setIsPlaying]    = useState(true);
  const [isEnded,      setIsEnded]      = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captionKey,   setCaptionKey]   = useState(0);
  const [progress,     setProgress]     = useState(0);
  // Controls visibility of the ingredient panel on mobile
  const [showIngredients, setShowIngredients] = useState(false);

  const intervalRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef       = useRef<HTMLDivElement>(null);
  const timelineRef        = useRef<HTMLDivElement>(null);      // mobile horizontal timeline
  const desktopTimelineRef = useRef<HTMLDivElement>(null);      // desktop vertical step list
  const ingPanelRef        = useRef<HTMLDivElement>(null);      // desktop ingredient scroll area
  const mobileIngPanelRef  = useRef<HTMLDivElement>(null);      // mobile ingredient scroll area

  const totalSlides   = slides.length;
  const currentSlide  = slides[currentIndex];

  // Which Ken Burns animation to use for a given slide index — cycles through all 8
  const kbAnim = KB_ANIMATIONS[currentIndex % KB_ANIMATIONS.length][0];

  // ─── Pre-compute per-slide ingredient sets ─────────────────────────────────
  // Done once at mount since slides and ingredients don't change.
  const slideIngredientSets = useRef<Set<number>[]>([]);
  useEffect(() => {
    slideIngredientSets.current = slides.map(s =>
      _getStepIngredients(s.instruction, ingredients)
    );
  }, [slides, ingredients]);

  // Accumulate which ingredients have been "used" up to and including currentIndex
  const usedIngredients = useRef<Set<number>>(new Set());
  useEffect(() => {
    // Accumulate — once an ingredient is used it stays checked
    const current = slideIngredientSets.current[currentIndex];
    if (current) {
      current.forEach(i => usedIngredients.current.add(i));
    }
  }, [currentIndex]);

  // Derive display state for each ingredient:
  //   'current'  — mentioned in the active slide
  //   'done'     — mentioned in a previous slide (or current, they overlap)
  //   'upcoming' — not yet mentioned
  const getIngredientStatus = (idx: number): 'current' | 'done' | 'upcoming' => {
    const current = slideIngredientSets.current[currentIndex];
    if (current?.has(idx)) return 'current';
    if (usedIngredients.current.has(idx)) return 'done';
    return 'upcoming';
  };

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
    setCaptionKey(k => k + 1);
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
    usedIngredients.current = new Set();
    setIsEnded(false);
    setIsPlaying(true);
    goTo(0);
  }, [clearTimers, goTo]);

  // ─── Autoplay engine ──────────────────────────────────────────────────────

  useEffect(() => {
    clearTimers();
    if (!isPlaying || isEnded) return;

    const tick = 50;
    const step = (tick / SLIDE_DURATION_MS) * 100;

    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(p + step, 100));
    }, tick);

    intervalRef.current = setInterval(() => {
      goNext();
    }, SLIDE_DURATION_MS);

    return () => clearTimers();
  }, [isPlaying, isEnded, currentIndex, goNext, clearTimers]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // ── Auto-scroll: mobile horizontal timeline ───────────────────────────────
  // Keeps the active step pill centred in the horizontal strip.
  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    const btn = tl.querySelector(`[data-step="${currentIndex}"]`) as HTMLElement | null;
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentIndex]);

  // ── Auto-scroll: desktop vertical timeline ────────────────────────────────
  // Keeps the active step visible in the scrollable step list.
  // Uses scrollIntoView with block:'nearest' so it only scrolls when the
  // element is outside the visible area — no jitter when already visible.
  useEffect(() => {
    const tl = desktopTimelineRef.current;
    if (!tl) return;
    const btn = tl.querySelector(`[data-step="${currentIndex}"]`) as HTMLElement | null;
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentIndex]);

  // ── Auto-scroll: ingredient panels (desktop + mobile) ────────────────────
  // Scrolls so the first currently-active ingredient is visible.
  // block:'nearest' avoids scrolling when already in view.
  useEffect(() => {
    const panels = [ingPanelRef.current, mobileIngPanelRef.current];
    for (const panel of panels) {
      if (!panel) continue;
      const active = panel.querySelector('[data-ing-current="true"]') as HTMLElement | null;
      if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex]);

  // ─── Play / Pause ──────────────────────────────────────────────────────────

  const togglePlay = () => {
    if (isEnded) restart();
    else setIsPlaying(p => !p);
  };

  // ─── Fullscreen API ────────────────────────────────────────────────────────

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
    } catch { /* fail silently */ }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────

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

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearTimers();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [clearTimers]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Inject Ken Burns keyframes — no external deps */}
      <style>{KB_STYLE}</style>

      {/* Modal container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex flex-col bg-black select-none"
      >

        {/* ── Segmented progress bar (top edge) ─────────────────────────── */}
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
            {/* Ingredient toggle — mobile only (panel is always visible on desktop) */}
            <button
              className="md:hidden text-white/70 hover:text-white text-xs px-2 py-1 rounded border border-white/30 hover:border-white/60 transition-colors"
              onClick={() => setShowIngredients(v => !v)}
            >
              {showIngredients ? 'Hide' : 'Ingredients'}
            </button>
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

        {/* ── Main body — image + sidebars ──────────────────────────────── */}
        <div className="relative flex-1 flex overflow-hidden">

          {/* ── Ken Burns image layer ────────────────────────────────────── */}
          {/*
            The <img> is always mounted — no remount, one network request.
            We swap only the animation name (via inline style) when the slide
            changes. Because the animation name changes, the browser restarts
            the animation from its initial keyframe, creating the seamless
            cinematic effect without any flicker.
          */}
          <div className="absolute inset-0 overflow-hidden">
            {/*
              The image is never remounted — one network request for the duration.
              Ken Burns: we use a wrapper div whose `key` changes per slide, which
              causes React to remount the WRAPPER (a cheap no-op div) and restart
              its CSS animation. The <img> itself stays mounted inside.
            */}
            <div
              key={currentIndex}
              className="w-full h-full"
              style={{ animation: `${kbAnim} ${SLIDE_DURATION_MS}ms ease-in-out both` }}
            >
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Persistent bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-10" />

          {/* ── Caption ──────────────────────────────────────────────────── */}
          <div
            key={captionKey}
            className="absolute inset-x-0 z-10 px-4 md:px-8 text-white animate-fade-in"
            style={{ bottom: 'calc(4rem + 1.5rem)' }}  // sits above the control bar
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
              Step {currentSlide.step} of {totalSlides}
            </p>
            <p className="text-base md:text-xl font-medium leading-snug drop-shadow-lg max-w-2xl">
              "{currentSlide.instruction}"
            </p>
          </div>

          {/* ── Tap zones (stories UX) ───────────────────────────────────── */}
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

          {/* ── Desktop vertical timeline sidebar ────────────────────────── */}
          <div
            className="hidden md:flex absolute right-0 top-0 bottom-0 z-20 flex-col"
            style={{ width: '220px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
          >
            <p className="text-white/50 text-[10px] uppercase tracking-widest px-4 pt-14 pb-2 font-semibold flex-shrink-0">
              Steps
            </p>
            {/* Steps list — takes all remaining space, scrolls independently */}
            <div ref={desktopTimelineRef} className="flex-1 min-h-0 overflow-y-auto">
              {slides.map((slide, i) => {
                const isPast    = i < currentIndex;
                const isCurrent = i === currentIndex;
                return (
                  <button
                    key={i}
                    data-step={i}
                    onClick={() => { setIsEnded(false); setIsPlaying(true); goTo(i); }}
                    className={`
                      w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors
                      ${isCurrent
                        ? 'bg-white/15 border-l-2 border-white'
                        : 'border-l-2 border-transparent hover:bg-white/10'
                      }
                    `}
                  >
                    <span className={`
                      flex-shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold
                      ${isPast    ? 'bg-green-500 text-white'
                        : isCurrent ? 'bg-white text-black'
                        :             'bg-white/20 text-white/60'}
                    `}>
                      {isPast ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className={`
                      text-xs leading-snug line-clamp-3
                      ${isCurrent ? 'text-white font-medium'
                        : isPast   ? 'text-green-400/80'
                        :            'text-white/50'}
                    `}>
                      {slide.instruction}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Desktop ingredient tracker — sizes to content, no fixed height */}
            {ingredients.length > 0 && (
              <div className="border-t border-white/10 flex-shrink-0 flex flex-col" style={{ maxHeight: '45%' }}>
                <p className="text-white/50 text-[10px] uppercase tracking-widest px-4 pt-3 pb-2 font-semibold flex-shrink-0">
                  Ingredients
                </p>
                {/* Scrollable only if content overflows the maxHeight cap */}
                <div ref={ingPanelRef} className="overflow-y-auto pb-2">
                  {ingredients.map((ing, idx) => {
                    const status = getIngredientStatus(idx);
                    const isCurrent = status === 'current';
                    return (
                      <div
                        key={idx}
                        data-ing-current={isCurrent ? 'true' : 'false'}
                        className="flex items-center gap-2 px-4 py-1"
                      >
                        <span className={`
                          flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center
                          ${isCurrent         ? 'bg-amber-400'
                            : status === 'done' ? 'bg-green-500'
                            :                     'bg-white/15'}
                        `}>
                          {status === 'done'    && <Check className="h-2.5 w-2.5 text-white" />}
                          {isCurrent            && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
                        </span>
                        <span className={`text-[11px] leading-tight line-clamp-1 ${
                          isCurrent           ? 'text-amber-300 font-semibold'
                          : status === 'done' ? 'text-green-400'
                          :                     'text-white/40'
                        }`}>
                          {ing}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile ingredient panel (toggleable) ─────────────────────── */}
          {showIngredients && ingredients.length > 0 && (
            <div
              ref={mobileIngPanelRef}
              className="md:hidden absolute left-0 right-0 bottom-16 z-20 max-h-48 overflow-y-auto"
              style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}
            >
              <p className="text-white/50 text-[10px] uppercase tracking-widest px-4 pt-3 pb-1 font-semibold">
                Ingredients
              </p>
              {ingredients.map((ing, idx) => {
                const status = getIngredientStatus(idx);
                const isCurrent = status === 'current';
                return (
                  <div
                    key={idx}
                    data-ing-current={isCurrent ? 'true' : 'false'}
                    className="flex items-center gap-2 px-4 py-1.5"
                  >
                    <span className={`
                      flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center
                      ${isCurrent           ? 'bg-amber-400'
                        : status === 'done' ? 'bg-green-500'
                        :                     'bg-white/15'}
                    `}>
                      {status === 'done' && <Check className="h-2.5 w-2.5 text-white" />}
                      {isCurrent         && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
                    </span>
                    <span className={`text-xs leading-tight ${
                      isCurrent           ? 'text-amber-300 font-semibold'
                      : status === 'done' ? 'text-green-400'
                      :                     'text-white/50'
                    }`}>
                      {ing}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Mobile horizontal timeline (scrollable) ──────────────────── */}
          <div
            ref={timelineRef}
            className="md:hidden absolute left-0 right-0 z-20 flex gap-2 overflow-x-auto px-3 py-2 scrollbar-none"
            style={{ top: '3.5rem', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}
          >
            {slides.map((slide, i) => {
              const isPast    = i < currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={i}
                  data-step={i}
                  onClick={() => { setIsEnded(false); setIsPlaying(true); goTo(i); }}
                  className={`
                    flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
                    text-xs font-medium transition-all
                    ${isCurrent
                      ? 'bg-white text-black scale-105'
                      : isPast
                        ? 'bg-green-500/80 text-white'
                        : 'bg-white/20 text-white/70 hover:bg-white/30'}
                  `}
                >
                  {isPast
                    ? <Check className="h-3 w-3" />
                    : <span className="h-4 w-4 flex items-center justify-center font-bold">{i + 1}</span>
                  }
                  <span className="hidden xs:inline max-w-[6rem] truncate">{slide.instruction.split(' ').slice(0, 4).join(' ')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Bottom control bar ─────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 py-3 px-4 bg-black/80 backdrop-blur-sm flex-shrink-0">
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

        {/* ── End overlay ───────────────────────────────────────────────── */}
        {isEnded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-30">
            <p className="text-white text-2xl font-bold mb-2">🍽️ Enjoy your meal!</p>
            <p className="text-white/60 text-sm mb-6">Storyboard complete</p>
            <div className="flex gap-3">
              <Button onClick={restart} className="bg-white text-black hover:bg-white/90">
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

