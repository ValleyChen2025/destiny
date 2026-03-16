'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageContext';

// Google Apps Script API URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzZ9YHlJE_It6JfRLDQVXkXURtdNqN4t0XQx0JA7reLPclRCEKw7nwbVkODoPBxSoEP/exec';

export default function QuoteForm() {
  const { t, lang } = useLanguage();
  const isZh = lang === 'zh';
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.result === 'success') {
        setSubmitted(true);
      } else {
        setError(data.error || '提交失败，请重试');
      }
    } catch (err) {
      console.error(err);
      setError('网络错误，请稍后重试');
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
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

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
          type="text"
          placeholder={isZh ? '邮箱或微信（选填其一）' : 'Email or WeChat (one is required)'}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t.quote.birthDate}</label>
          <input
            name="birthdate"
            required
            type="date"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t.quote.birthTime}</label>
          <input
            name="birthtime"
            required
            placeholder={isZh ? '如：1990-05-20 09:30 或 上午9点半' : 'e.g., 1990-05-20 09:30 or 9:30 AM'}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.quote.birthPlace}</label>
        <input
          name="birthplace"
          required
          placeholder={isZh ? '如：中国上海市' : 'e.g., Shanghai, China'}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t.quote.message}</label>
        <textarea
          name="note"
          rows={4}
          placeholder={isZh ? '例如：想了解事业财运/婚姻健康/流年运势等' : 'e.g., Career, love, health, yearly fortune, etc.'}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* 隐藏字段：语言标记 */}
      <input type="hidden" name="language" value={lang} />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
      >
        {loading ? (isZh ? '提交中...' : 'Submitting...') : t.quote.submit}
      </button>

      <p className="text-center text-sm text-gray-500">
        {isZh ? '提交后24小时内客服联系您' : 'We will contact you within 24 hours'}
      </p>
    </form>
  );
}
