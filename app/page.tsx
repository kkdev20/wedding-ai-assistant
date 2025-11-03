// app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Sun, Moon, Bot, MapPin, DollarSign, Venus, Calendar, Users, Sparkles } from 'lucide-react';
import { type Language, useTranslations } from '@/lib/translations';
import LanguageToggle from '@/components/LanguageToggle';
import AuthButton from '@/components/AuthButton';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const t = useTranslations(language);

  useEffect(() => {
    try {
      setMounted(true);
      if (typeof window !== 'undefined') {
        const savedMode = localStorage.getItem('darkMode');
        const savedLang = localStorage.getItem('language') as Language;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedMode !== null) {
          setDarkMode(savedMode === 'true');
        } else {
          setDarkMode(systemPrefersDark);
        }
        
        if (savedLang === 'en' || savedLang === 'id') {
          setLanguage(savedLang);
        }
      }
    } catch (error) {
      console.error('Error initializing home page:', error);
      setMounted(true); // Still mount to show content
    }
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    try {
      localStorage.setItem('language', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }, [language, mounted]);

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', darkMode.toString());
      }
    } catch (error) {
      console.error('Error setting dark mode:', error);
    }
  }, [darkMode, mounted]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'id' : 'en');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header Minimal */}
      <header className="px-6 py-4 flex justify-between items-center absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400"></div>
          <div className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
            BaliAI
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {typeof window !== 'undefined' && (
            <>
              <AuthButton />
              <LanguageToggle language={language} onToggle={toggleLanguage} />
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 border border-gray-200 dark:border-gray-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content - Everything in One View */}
      <main className="min-h-screen flex flex-col justify-center items-center px-4 py-16">
        {/* Hero Section - Center */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-full text-sm font-medium border border-rose-200 dark:border-rose-800">
              <div className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400"></div>
              {t.home.aiPlanning}
            </span>
          </div>
       <h1 className="text-5xl md:text-6xl font-bold mb-6">
  <span className="bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
    {t.home.title}
   
  </span>
</h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t.home.subtitle}
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap mb-8">
            <Link 
              href="/planner" 
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="w-2 h-2 rounded-full bg-white"></div>
              {t.home.startPlanning}
            </Link>
            
            <Link 
              href="/chat" 
              className="group inline-flex items-center gap-2 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-md"
            >
              <Bot className="w-4 h-4" />
              {t.home.aiAssistant}
            </Link>
          </div>
        </div>

        {/* Features Grid - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {/* Feature 1 */}
          <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-rose-200 dark:hover:border-rose-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-xl group-hover:from-rose-200 group-hover:to-pink-200 dark:group-hover:from-rose-800/40 dark:group-hover:to-pink-800/40 transition-all">
                <Bot className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {t.home.aiPlanner}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
              {t.home.aiPlannerDesc}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-rose-200 dark:hover:border-rose-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-xl group-hover:from-rose-200 group-hover:to-pink-200 dark:group-hover:from-rose-800/40 dark:group-hover:to-pink-800/40 transition-all">
                <MapPin className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {t.home.baliVenues}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
              {t.home.baliVenuesDesc}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-rose-200 dark:hover:border-rose-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-xl group-hover:from-rose-200 group-hover:to-pink-200 dark:group-hover:from-rose-800/40 dark:group-hover:to-pink-800/40 transition-all">
                <DollarSign className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                {t.home.budgetTool}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
              {t.home.budgetToolDesc}
            </p>
          </div>
        </div>

        {/* Quick Stats - Compact */}
        <div className="flex justify-center gap-8 mt-12 text-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <div>
              <div className="text-lg font-bold text-rose-600 dark:text-rose-400">500+</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t.home.statsVenues}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <div>
              <div className="text-lg font-bold text-rose-600 dark:text-rose-400">$5M+</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t.home.statsPlanned}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <div>
              <div className="text-lg font-bold text-rose-600 dark:text-rose-400">24/7</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t.home.statsSupport}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}