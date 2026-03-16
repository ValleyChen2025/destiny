'use client';

import { useLanguage } from '@/components/LanguageContext';

export default function ArticlesPage() {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-4">📄 {isZh ? '文章' : 'Articles'}</h1>

      <div className="text-center mb-8">
        <span className="inline-block px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg">
          📢 {isZh ? '内容持续更新中，敬请期待！' : 'Content coming soon, stay tuned!'}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border overflow-hidden"
          >
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">
                {isZh ? `文章${i}（待发布）` : `Article ${i} (Coming Soon)`}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {isZh ? '深度解析八字核心逻辑，助您自主入门' : 'Deep analysis of Bazi fundamentals'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {isZh ? '即将上线' : 'Coming Soon'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
