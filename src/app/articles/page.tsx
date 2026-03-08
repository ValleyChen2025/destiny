'use client';

import ContentCard from '@/components/ContentCard';
import articles from '@/data/articles.json';

export default function ArticlesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-8">📄 文章</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((article) => (
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
  );
}
