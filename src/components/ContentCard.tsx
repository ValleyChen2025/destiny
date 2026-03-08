'use client';

import { useLanguage } from './LanguageContext';

interface ContentCardProps {
  type: 'article' | 'video';
  title: string;
  titleEn: string;
  summary?: string;
  summaryEn?: string;
  date: string;
}

export default function ContentCard({ type, title, titleEn, summary, summaryEn, date }: ContentCardProps) {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center">
        <span className="text-4xl">{type === 'article' ? '📄' : '🎬'}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">
          {isZh ? title : titleEn}
        </h3>
        {summary && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {isZh ? summary : summaryEn}
          </p>
        )}
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
  );
}
