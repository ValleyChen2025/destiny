'use client';

import { useLanguage } from '@/components/LanguageContext';
import QuoteForm from '@/components/QuoteForm';

export default function QuotePage() {
  const { t, lang } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-4">{t.quote.title}</h1>

      <QuoteForm />
    </div>
  );
}
