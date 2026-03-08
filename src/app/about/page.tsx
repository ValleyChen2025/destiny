'use client';

import { useLanguage } from '@/components/LanguageContext';

export default function AboutPage() {
  const { t, lang } = useLanguage();
  const isZh = lang === 'zh';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-8">{t.about.title}</h1>

      <div className="prose dark:prose-invert mx-auto">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {t.about.content}
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 mt-12">
        <h2 className="text-xl font-bold mb-4">🔒 {t.about.privacyTitle}</h2>
        <p className="text-gray-600 dark:text-gray-300">
          {t.about.privacyContent}
        </p>
      </div>
    </div>
  );
}
