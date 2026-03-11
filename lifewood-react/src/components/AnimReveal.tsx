import type { FC } from 'react';
import { useInView } from '../hooks/useInView';

interface AnimRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'slide-left' | 'slide-right' | 'scale';
  delay?: number;
}

const AnimReveal: FC<AnimRevealProps> = ({ children, className = '', animation = 'fade-up', delay = 0 }) => {
  const { ref, isVisible } = useInView();

  return (
    <div
      ref={ref}
      className={`anim-reveal anim-${animation} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimReveal;
