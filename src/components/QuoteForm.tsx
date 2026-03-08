'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageContext';

export default function QuoteForm() {
  const { t, lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      contact: formData.get('contact'),
      birthDate: formData.get('birthDate'),
      birthTime: formData.get('birthTime'),
      birthPlace: formData.get('birthPlace'),
      message: formData.get('message'),
      lang,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2">{t.quote.success}</h2>
        <p className="text-gray-500">{t.quote.successDesc}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t.quote.name}</label>
        <input
          name="name"
          required
          placeholder={t.quote.namePlaceholder}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.quote.contact}</label>
        <input
          name="contact"
          required
          type="email"
          placeholder={t.quote.contactPlaceholder}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t.quote.birthDate}</label>
          <input
            name="birthDate"
            required
            type="date"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.quote.birthTime}</label>
          <input
            name="birthTime"
            required
            placeholder={t.quote.birthTimePlaceholder}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.quote.birthPlace}</label>
        <input
          name="birthPlace"
          required
          placeholder={t.quote.birthPlacePlaceholder}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.quote.message}</label>
        <textarea
          name="message"
          rows={4}
          placeholder={t.quote.messagePlaceholder}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
      >
        {loading ? '...' : t.quote.submit}
      </button>
    </form>
  );
}
