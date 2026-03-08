'use client';

import ContentCard from '@/components/ContentCard';
import videos from '@/data/videos.json';

export default function VideosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-8">🎬 视频</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {videos.map((video) => (
          <ContentCard
            key={video.id}
            type="video"
            title={video.title}
            titleEn={video.titleEn}
            date={video.date}
          />
        ))}
      </div>
    </div>
  );
}
