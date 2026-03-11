import { useEffect, useRef, useState, type FC } from 'react';

interface CountUpStatProps {
  value: number;       // numeric target
  suffix?: string;     // e.g. '+' or ',000+'
  duration?: number;   // ms
  format?: boolean;    // thousands comma
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

const CountUpStat: FC<CountUpStatProps> = ({
  value,
  suffix = '',
  duration = 1800,
  format = false,
}) => {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);
            const current = Math.round(eased * value);
            setDisplay(format ? current.toLocaleString() : String(current));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, format]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
};

export default CountUpStat;
