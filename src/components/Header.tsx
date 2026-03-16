'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { t, lang, setLang } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isZh = lang === 'zh';

  const navItems = [
    { href: '/', label: isZh ? '首页' : 'Home' },
    { href: '/articles', label: isZh ? '文章' : 'Articles', badge: isZh ? '即将上线' : 'Soon' },
    { href: '/videos', label: isZh ? '视频' : 'Videos', badge: isZh ? '即将上线' : 'Soon' },
    { href: '/about', label: isZh ? '关于' : 'About' },
    { href: '/quote', label: isZh ? '询价' : 'Quote' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            {t.site.title}
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm hover:text-blue-500 transition-colors ${
                  pathname === item.href ? 'text-blue-500 font-medium' : ''
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="ml-1 text-xs text-gray-400">({item.badge})</span>
                )}
              </Link>
            ))}
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="text-sm px-2 py-1 rounded border hover:bg-gray-100 transition-colors"
            >
              {lang === 'zh' ? 'EN' : '中'}
            </button>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden py-4 border-t">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block py-2 text-sm hover:text-blue-500 ${
                  pathname === item.href ? 'text-blue-500 font-medium' : ''
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="ml-1 text-xs text-gray-400">({item.badge})</span>
                )}
              </Link>
            ))}
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="mt-2 text-sm px-2 py-1 rounded border"
            >
              {lang === 'zh' ? 'English' : '中文'}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
