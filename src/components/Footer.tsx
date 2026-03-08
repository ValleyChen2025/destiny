'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-50 dark:bg-zinc-900 border-t py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <Link href="/about" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            {t.footer.about}
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            {t.footer.privacy}
          </Link>
          <Link href="/quote" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            {t.footer.contact}
          </Link>
        </div>
        <p className="text-center text-gray-500 text-sm">
          {t.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
