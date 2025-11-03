'use client';

import { Globe } from 'lucide-react';
import type { Language } from '@/lib/translations';

interface LanguageToggleProps {
  language: Language;
  onToggle: () => void;
  darkMode?: boolean;
}

export default function LanguageToggle({ language, onToggle, darkMode = false }: LanguageToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 border border-gray-200 dark:border-gray-600 flex items-center gap-2"
      aria-label="Toggle language"
      title={`Switch to ${language === 'en' ? 'Indonesian' : 'English'}`}
    >
      <Globe className="w-5 h-5 text-rose-600 dark:text-rose-400" />
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {language.toUpperCase()}
      </span>
    </button>
  );
}



