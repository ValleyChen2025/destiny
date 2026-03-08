'use client';

import ServiceHero from '@/components/ServiceHero';
import ContentCard from '@/components/ContentCard';
import articles from '@/data/articles.json';
import videos from '@/data/videos.json';

export default function Home() {
  return (
    <>
      <ServiceHero />

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">📄 文章</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {articles.slice(0, 3).map((article) => (
              <ContentCard
                key={article.id}
                type="article"
                title={article.title}
                titleEn={article.titleEn}
                summary={article.summary}
                summaryEn={article.summaryEn}
                date={article.date}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 dark:bg-zinc-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">🎬 视频</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {videos.slice(0, 3).map((video) => (
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
      </section>
    </>
  );
}
