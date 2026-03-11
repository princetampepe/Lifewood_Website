import type { FC } from 'react';
import AnimReveal from './AnimReveal';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  heading?: string;
}

const YouTubeEmbed: FC<YouTubeEmbedProps> = ({ videoId, title = 'YouTube video', heading }) => (
  <AnimReveal>
    <div className="yt-embed-section">
      {heading && <h3 className="yt-embed-heading">{heading}</h3>}
      <div className="yt-embed-wrapper">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  </AnimReveal>
);

export default YouTubeEmbed;
