'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageContext';

export default function ServiceHero() {
  const { t, lang } = useLanguage();

  const isZh = lang === 'zh';

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <div className="text-6xl mb-6">🔮</div>

        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {isZh ? t.home.heroTitle : t.home.heroTitleEn}
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
          {isZh ? t.home.heroSubtitle : t.home.heroSubtitleEn}
        </p>

        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8" />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/quote"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors"
          >
            {t.home.ctaPrimary}
          </Link>
          <Link
            href="/about"
            className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 rounded-full font-semibold transition-colors"
          >
            {t.home.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
