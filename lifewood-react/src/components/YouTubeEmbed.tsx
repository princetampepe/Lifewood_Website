import { useState, useCallback, type FC } from 'react';
import AnimReveal from './AnimReveal';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  heading?: string;
}

/**
 * YouTube embed with click-to-load facade.
 * Renders a thumbnail first — only loads the heavy iframe on interaction.
 * Saves ~500KB+ per embed on initial page load.
 */
const YouTubeEmbed: FC<YouTubeEmbedProps> = ({ videoId, title = 'YouTube video', heading }) => {
  const [activated, setActivated] = useState(false);

  const activate = useCallback(() => setActivated(true), []);

  return (
    <AnimReveal>
      <div className="yt-embed-section">
        {heading && <h3 className="yt-embed-heading">{heading}</h3>}
        <div className="yt-embed-wrapper">
          {activated ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              className="yt-facade"
              onClick={activate}
              aria-label={`Play ${title}`}
              type="button"
            >
              <img
                src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                alt={title}
                loading="lazy"
                decoding="async"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <svg className="yt-play-btn" viewBox="0 0 68 48" aria-hidden="true">
                <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/>
                <path d="M45 24 27 14v20" fill="#fff"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </AnimReveal>
  );
};

export default YouTubeEmbed;
