import { useState, useCallback, useEffect, useRef, type FC } from 'react';
import type { CarouselStep } from '../data/siteData';

interface StepCarouselProps {
  steps: CarouselStep[];
  hoverToSwitch?: boolean;
}

const StepCarousel: FC<StepCarouselProps> = ({ steps, hoverToSwitch = false }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToStep = useCallback((idx: number) => {
    setActiveIdx(idx);
    // Pause auto-advance on manual interaction, resume after 8 s
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), 8000);
  }, []);

  // Auto-advance every 5 s
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused, steps.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (resumeTimer.current) clearTimeout(resumeTimer.current); };
  }, []);

  const step = steps[activeIdx];

  return (
    <div
      className="wwo-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Tabs — rendered first so CSS order can move them above image on mobile */}
      <div className="wwo-carousel-tabs">
        {steps.map((s, i) => (
          <button
            key={i}
            className={`wwo-carousel-tab ${i === activeIdx ? 'active' : ''}`}
            onMouseEnter={() => hoverToSwitch && goToStep(i)}
            onClick={() => goToStep(i)}
          >
            <span className="tab-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="tab-label">{s.title}</span>
          </button>
        ))}
      </div>

      <div className="wwo-carousel-content">
        <h3 className="carousel-step-title">{step.title}</h3>
        <p className="carousel-step-text">{step.text}</p>
      </div>

      <div className="wwo-carousel-image">
        <img
          key={activeIdx}
          src={step.img}
          className="carousel-step-img"
          loading="lazy"
          alt={step.title}
        />
      </div>
    </div>
  );
};

export default StepCarousel;
