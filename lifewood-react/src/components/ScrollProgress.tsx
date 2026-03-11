import type { FC } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

const ScrollProgress: FC = () => {
  const progress = useScrollProgress();
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
};

export default ScrollProgress;
