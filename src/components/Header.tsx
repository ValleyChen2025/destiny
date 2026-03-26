'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';

export default function Header() {
  const { t, lang, setLang } = useLanguage();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-bold">
            {t.site.title}
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/fortune"
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                pathname === '/fortune'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              {lang === 'zh' ? '命理' : 'Fortune'}
            </Link>

            <Link
              href="/quote"
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                pathname === '/quote'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              {lang === 'zh' ? '询价' : 'Quote'}
            </Link>

            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="text-sm px-2 py-1 rounded border hover:bg-gray-100 transition-colors"
            >
              {lang === 'zh' ? 'EN' : '中'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
