import { memo, type FC } from 'react';

interface MarqueeStripProps {
  items: string[];
  reverse?: boolean;
}

const MarqueeStrip: FC<MarqueeStripProps> = memo(({ items, reverse = false }) => {
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
});

MarqueeStrip.displayName = 'MarqueeStrip';

export default MarqueeStrip;
