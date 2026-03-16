'use client';

import { useLanguage } from '@/components/LanguageContext';
import QuoteForm from '@/components/QuoteForm';

export default function QuotePage() {
  const { t, lang } = useLanguage();
  const isZh = lang === 'zh';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-4">{t.quote.title}</h1>

      <div className="text-center mb-8">
        <span className="inline-block px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-lg">
          {isZh ? '服务价格：$360起' : 'Price: Starting from $360'}
          <span className="text-sm text-gray-500 ml-2">
            ({isZh ? '根据命盘复杂度浮动' : 'Based on complexity'})
          </span>
        </span>
      </div>

      <QuoteForm />
    </div>
  );
}
