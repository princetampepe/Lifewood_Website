import React, { useEffect, useState } from 'react';
import type { FC } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  loop?: boolean;
  className?: string;
}

const Typewriter: FC<TypewriterProps> = ({ text, speed = 28, loop = false, className = '' }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let mounted = true;
    let pos = 0;
    let timeout = 0;

    const run = () => {
      if (!mounted) return;
      if (pos <= text.length) {
        setDisplayed(text.slice(0, pos));
        pos += 1;
        timeout = window.setTimeout(run, speed);
      } else if (loop) {
        timeout = window.setTimeout(() => {
          pos = 0;
          run();
        }, 900);
      }
    };

    run();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [text, speed, loop]);

  return (
    <span className={`typewriter ${className}`} aria-live="polite">
      {displayed}
      <span className="typewriter-caret" aria-hidden>│</span>
    </span>
  );
};

export default Typewriter;
