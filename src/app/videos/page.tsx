'use client';

import { useLanguage } from '@/components/LanguageContext';

export default function VideosPage() {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-4">🎬 {isZh ? '视频' : 'Videos'}</h1>

      <div className="text-center mb-8">
        <span className="inline-block px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg">
          📢 {isZh ? '内容持续更新中，敬请期待！' : 'Content coming soon, stay tuned!'}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          isZh ? '视频教程（第一季）' : 'Video Tutorial (Season 1)',
          isZh ? '案例精讲（待更新）' : 'Case Studies (Coming)',
          isZh ? '互动答疑（筹备中）' : 'Q&A Sessions (Preparing)'
        ].map((title, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border overflow-hidden"
          >
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center">
              <span className="text-4xl">🎬</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {isZh ? '专业命理讲解与案例分析' : 'Professional Bazi analysis and case studies'}
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
