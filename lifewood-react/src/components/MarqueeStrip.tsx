import type { FC } from 'react';

interface MarqueeStripProps {
  items: string[];
  reverse?: boolean;
}

const MarqueeStrip: FC<MarqueeStripProps> = ({ items, reverse = false }) => {
  const doubled = [...items, ...items];

  return (
    <div className={`marquee-strip ${reverse ? 'reverse' : ''}`}>
      <div className={reverse ? 'marquee-track-reverse' : 'marquee-track'}>
        {doubled.map((item, i) => (
          <span className="marquee-item" key={i}>
            {item} <span className="marquee-dot">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeStrip;
