// app/planner/page.tsx - FULLY FIXED VERSION
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin, 
  Sparkles,
  CheckCircle,
  Palette,
  Camera,
  Utensils,
  Gift,
  Sun, 
  Moon,
  Heart,
  Home,
  Building,
  Cloud,
  MessageCircle,
  Clock,
  Star,
  Download,
  Save,
  Upload,
  Share2,
  Image,
  Copy,
  Check
} from 'lucide-react';
import { type Language, useTranslations } from '@/lib/translations';
import LanguageToggle from '@/components/LanguageToggle';
import { setupRealtimePlansSubscription, getCurrentUser } from '@/lib/db-helpers';
import { supabase } from '@/lib/supabase-browser';

interface VenueRecommendation {
  id?: string;
  name: string;
  type?: string;
  location?: string;
  price: number;
  guests: string;
  description: string;
  matchScore?: number;
}

interface AIRecommendations {
  venues: VenueRecommendation[];
  aiVenueSuggestions?: Array<{name: string; reason: string; matchScore: number}>;
  budgetTips: string;
  vendorSuggestions: string[];
  timelineAdvice: string;
  recommendations?: {
    bestFor: string;
    priority: string;
  };
  source?: 'ai' | 'smart';
}

function PlannerPageContent() {
  const searchParams = useSearchParams();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const t = useTranslations(language);
  const [step, setStep] = useState(0); // 0 = Welcome screen
  const [weddingData, setWeddingData] = useState({
    guestCount: 50,
    budget: 10000,
    season: 'april-october',
    venueType: 'beach',
    date: '',
    location: 'bali'
  });
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendations | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [realtimeSyncActive, setRealtimeSyncActive] = useState(false);
  const PLAN_STORAGE_KEY = 'wedding-plan-saved';
  const USD_TO_IDR_RATE = 16000; // 1 USD = 16.000 IDR

  // Helper function to format currency based on language
  const formatCurrency = (amountUSD: number): string => {
    if (language === 'id') {
      const amountIDR = amountUSD * USD_TO_IDR_RATE;
      return `Rp ${amountIDR.toLocaleString('id-ID')}`;
    }
    return `$${amountUSD.toLocaleString()}`;
  };

  // Helper function to get currency symbol/icon
  const CurrencyDisplay = ({ amount }: { amount: number }) => {
    if (language === 'id') {
      return <span>{formatCurrency(amount)}</span>;
    }
    return (
      <div className="flex items-center gap-1">
        <DollarSign className="w-4 h-4" />
        <span>{amount.toLocaleString()}</span>
      </div>
    );
  };

  useEffect(() => {
    try {
      setMounted(true);
      if (typeof window === 'undefined') return;
      
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
    } catch (error) {
      console.error('Error initializing planner:', error);
      setMounted(true); // Still mount to show content
    }
  }, []);

  // Setup real-time sync for wedding plans
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    let subscription: any = null;

    const setupRealtimeSync = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          console.log('User not logged in, real-time sync disabled');
          return;
        }

        console.log('🔄 Setting up real-time sync for wedding plans...');
        subscription = setupRealtimePlansSubscription(user.id, {
          onInsert: (newPlan) => {
            console.log('📥 New plan inserted via real-time:', newPlan);
            // Only update if it's not from current session (avoid self-updates)
            const planData = newPlan.plan_data;
            if (planData && planData.weddingData) {
              setWeddingData(planData.weddingData);
            }
            if (planData && planData.aiRecommendations) {
              setAiRecommendations(planData.aiRecommendations);
            }
            if (planData && planData.step !== undefined) {
              setStep(planData.step);
            }
            
            // Show notification
            if (language === 'id') {
              alert('Rencana diperbarui dari perangkat lain!');
            } else {
              alert('Plan updated from another device!');
            }
          },
          onUpdate: (updatedPlan) => {
            console.log('🔄 Plan updated via real-time:', updatedPlan);
            // Update local state with new plan data
            const planData = updatedPlan.plan_data;
            if (planData && planData.weddingData) {
              setWeddingData(planData.weddingData);
            }
            if (planData && planData.aiRecommendations) {
              setAiRecommendations(planData.aiRecommendations);
            }
            if (planData && planData.step !== undefined) {
              setStep(planData.step);
            }
            
            // Show notification
            if (language === 'id') {
              alert('Rencana diperbarui dari perangkat lain!');
            } else {
              alert('Plan updated from another device!');
            }
          },
          onDelete: (planId) => {
            console.log('🗑️ Plan deleted via real-time:', planId);
            // Reset to welcome screen if current plan is deleted
            setStep(0);
            setWeddingData({
              guestCount: 50,
              budget: 10000,
              season: 'april-october',
              venueType: 'beach',
              date: '',
              location: 'bali'
            });
            setAiRecommendations(null);
            
            if (language === 'id') {
              alert('Rencana dihapus dari perangkat lain');
            } else {
              alert('Plan deleted from another device');
            }
          }
        });

        setRealtimeSyncActive(true);
        console.log('✅ Real-time sync active');
      } catch (error) {
        console.error('Error setting up real-time sync:', error);
      }
    };

    setupRealtimeSync();

    // Cleanup on unmount
    return () => {
      if (subscription) {
        console.log('🔌 Unsubscribing from real-time updates');
        subscription.unsubscribe();
        setRealtimeSyncActive(false);
      }
    };
  }, [mounted, language]);

  // Separate useEffect for handling shared URL - ONLY skip welcome screen for shared links
  useEffect(() => {
    if (!mounted) return;
    
    const shared = searchParams.get('shared');
    if (shared === 'true') {
      const guestCount = searchParams.get('guestCount');
      const budget = searchParams.get('budget');
      const venueType = searchParams.get('venueType');
      const season = searchParams.get('season');
      
      if (guestCount && budget && venueType && season) {
        setWeddingData({
          guestCount: parseInt(guestCount),
          budget: parseInt(budget),
          venueType: venueType as 'beach' | 'villa' | 'resort',
          season: season as 'april-october' | 'november-march',
          date: '',
          location: 'bali'
        });
        setStep(4); // Skip welcome screen ONLY for shared links
      }
    }
    // DON'T auto-load saved plan - always start at welcome screen (step 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);
  
  const savePlan = async () => {
    try {
      if (typeof window === 'undefined') return;
      if (!mounted) return; // Wait until component is mounted
      
      const planData = {
        weddingData,
        aiRecommendations,
        timestamp: new Date().toISOString(),
        step
      };
      
      // Try to save to database if user is logged in
      try {
        // Dynamic import to avoid SSR issues
        if (typeof window === 'undefined') {
          // Fallback to localStorage only
          localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(planData));
          setPlanSaved(true);
          if (language === 'id') {
            alert('Rencana berhasil disimpan (offline mode)');
          } else {
            alert('Plan saved (offline mode)');
          }
          setTimeout(() => setPlanSaved(false), 3000);
          return;
        }
        
        const { supabase } = await import('@/lib/supabase-browser');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          // Fall through to localStorage save
        }
        
        if (user) {
          // User is logged in - save to database
          const { saveWeddingPlanToDB } = await import('@/lib/db-helpers');
          
          await saveWeddingPlanToDB({
            guestCount: weddingData.guestCount,
            budget: weddingData.budget,
            venueType: weddingData.venueType,
            season: weddingData.season,
            planData: planData,
            step: step
          });
          
          // Also save to localStorage as backup
          localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(planData));
          setPlanSaved(true);
          
          if (language === 'id') {
            alert('Rencana berhasil disimpan ke cloud!');
          } else {
            alert('Plan saved to cloud successfully!');
          }
          
          setTimeout(() => setPlanSaved(false), 3000);
          return;
        }
      } catch (dbError: any) {
        console.error('Database save error:', dbError);
        // Fall through to localStorage save
      }
      
      // Fallback to localStorage if not logged in or database fails
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(planData));
      setPlanSaved(true);
      
      if (language === 'id') {
        alert('Rencana berhasil disimpan (offline mode). Login untuk sync ke cloud!');
      } else {
        alert('Plan saved (offline mode). Sign in to sync to cloud!');
      }
      
      setTimeout(() => setPlanSaved(false), 3000);
    } catch (error) {
      console.error('Error saving plan:', error);
      alert(language === 'id' ? 'Gagal menyimpan rencana' : 'Failed to save plan');
    }
  };
  
  const loadSavedPlan = async () => {
    try {
      if (typeof window === 'undefined') return;
      if (!mounted) return; // Wait until component is mounted
      
      // Try to load from database if user is logged in
      try {
        // Dynamic import to avoid SSR issues
        if (typeof window === 'undefined') {
          // Fallback to localStorage only
          const saved = localStorage.getItem(PLAN_STORAGE_KEY);
          if (saved) {
            try {
              const planData = JSON.parse(saved);
              if (planData.weddingData) setWeddingData(planData.weddingData);
              if (planData.aiRecommendations) setAiRecommendations(planData.aiRecommendations);
              if (planData.step && planData.step > 0) setStep(planData.step);
            } catch (e) {
              console.error('Error parsing saved plan:', e);
            }
          }
          return;
        }
        
        const { supabase } = await import('@/lib/supabase-browser');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          // Fall through to localStorage load
        }
        
        if (user) {
          // User is logged in - load from database
          const { loadWeddingPlansFromDB } = await import('@/lib/db-helpers');
          const plans = await loadWeddingPlansFromDB();
          
          if (plans && plans.length > 0) {
            // Load the most recent plan
            const latestPlan = plans[0];
            const planData = latestPlan.plan_data;
            
            if (planData && planData.weddingData) {
              setWeddingData(planData.weddingData);
            }
            if (planData && planData.aiRecommendations) {
              setAiRecommendations(planData.aiRecommendations);
            }
            if (planData && planData.step && planData.step > 0) {
              setStep(planData.step);
            }
            
            if (language === 'id') {
              alert('Rencana berhasil dimuat dari cloud!');
            } else {
              alert('Plan loaded from cloud successfully!');
            }
            return;
          }
        }
      } catch (dbError: any) {
        console.error('Database load error:', dbError);
        // Fall through to localStorage load
      }
      
      // Fallback to localStorage
      const saved = localStorage.getItem(PLAN_STORAGE_KEY);
      if (saved) {
        let planData;
        try {
          planData = JSON.parse(saved);
        } catch (parseError) {
          console.error('Error parsing saved plan:', parseError);
          if (language === 'id') {
            alert('Error memuat rencana tersimpan');
          } else {
            alert('Error loading saved plan');
          }
          return;
        }
        if (planData.weddingData) {
          setWeddingData(planData.weddingData);
        }
        if (planData.aiRecommendations) {
          setAiRecommendations(planData.aiRecommendations);
        }
        if (planData.step && planData.step > 0) {
          setStep(planData.step);
        }
        
        if (language === 'id') {
          alert('Rencana berhasil dimuat (offline mode)');
        } else {
          alert('Plan loaded (offline mode)');
        }
      } else {
        if (language === 'id') {
          alert('Tidak ada rencana tersimpan');
        } else {
          alert('No saved plan found');
        }
      }
    } catch (error) {
      console.error('Error loading plan:', error);
      alert(language === 'id' ? 'Gagal memuat rencana' : 'Failed to load plan');
    }
  };
  
  const exportToPDF = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      // Show loading feedback
      const loadingMsg = language === 'id' ? 'Mengekspor PDF...' : 'Exporting PDF...';
      
      // Dynamic import untuk avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      // Get the plan summary element - wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = document.getElementById('plan-summary');
      if (!element) {
        alert(language === 'id' ? 'Element tidak ditemukan. Pastikan Anda berada di halaman summary.' : 'Element not found. Please make sure you are on the summary page.');
        return;
      }
      
      // Show loading
      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'wait';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: darkMode ? '#111827' : '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`wedding-plan-${weddingData.guestCount}-guests-${new Date().getTime()}.pdf`);
      
      // Reset cursor
      document.body.style.cursor = originalCursor;
      
      // Show success feedback
      if (language === 'id') {
        alert('PDF berhasil diekspor!');
      } else {
        alert('PDF exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      document.body.style.cursor = 'default';
      alert(language === 'id' ? 'Gagal mengekspor PDF. Pastikan browser mendukung fitur ini dan coba lagi.' : 'Failed to export PDF. Please ensure your browser supports this feature and try again.');
    }
  };
  
  const sharePlan = async () => {
    try {
      const shareUrl = `${window.location.origin}/planner?${new URLSearchParams({
        guestCount: weddingData.guestCount.toString(),
        budget: weddingData.budget.toString(),
        venueType: weddingData.venueType,
        season: weddingData.season,
        shared: 'true'
      })}`;
      
      if (navigator.share) {
        await navigator.share({
          title: language === 'id' ? 'Rencana Pernikahan Bali Saya' : 'My Bali Wedding Plan',
          text: language === 'id' 
            ? `Pernikahan untuk ${weddingData.guestCount} tamu dengan budget ${formatCurrency(weddingData.budget)}`
            : `Wedding for ${weddingData.guestCount} guests with ${formatCurrency(weddingData.budget)} budget`,
          url: shareUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      }
    } catch (error) {
      console.error('Error sharing plan:', error);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('language', language);
  }, [language, mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode, mounted]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'id' : 'en');
  };

  const updateWeddingData = (key: string, value: any) => {
    setWeddingData(prev => ({ ...prev, [key]: value }));
  };

  // Fallback venue recommendations (hardcoded)
  const fallbackVenueRecommendations = {
    beach: [
      { name: 'Jimbaran Bay Beach', price: 3000, guests: '50-100', description: 'Sunset ceremonies with golden hour views' },
      { name: 'Nusa Dua Resort', price: 5000, guests: '80-150', description: 'Luxury beachfront with full amenities' },
      { name: 'Uluwatu Cliffside', price: 4000, guests: '30-80', description: 'Dramatic ocean cliff views' }
    ],
    villa: [
      { name: 'Private Ubud Villa', price: 2500, guests: '20-50', description: 'Intimate jungle setting with pool' },
      { name: 'Seminyak Luxury Villa', price: 3500, guests: '30-70', description: 'Modern design close to amenities' }
    ],
    resort: [
      { name: 'Ayana Resort', price: 8000, guests: '100-200', description: 'World-class facilities multiple venues' },
      { name: 'Four Seasons', price: 10000, guests: '50-120', description: 'Ultra-luxury service and privacy' }
    ]
  };

  // Fetch AI-powered recommendations when reaching step 3
  useEffect(() => {
    if (step === 3 && weddingData.guestCount && weddingData.budget && weddingData.venueType && weddingData.season) {
      fetchAIRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, weddingData.guestCount, weddingData.budget, weddingData.venueType, weddingData.season, language]);

  const fetchAIRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestCount: weddingData.guestCount,
          budget: weddingData.budget,
          venueType: weddingData.venueType,
          season: weddingData.season,
          language: language
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiRecommendations(data);
      } else {
        // Fallback to smart recommendations
        setAiRecommendations(null);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setAiRecommendations(null);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Get current venue recommendations (AI or fallback)
  const getCurrentVenueRecommendations = (): VenueRecommendation[] => {
    if (aiRecommendations?.venues && aiRecommendations.venues.length > 0) {
      return aiRecommendations.venues;
    }
    return fallbackVenueRecommendations[weddingData.venueType as keyof typeof fallbackVenueRecommendations] || [];
  };

  const budgetBreakdown = {
    venue: weddingData.budget * 0.4,
    catering: weddingData.budget * 0.25,
    photography: weddingData.budget * 0.1,
    decoration: weddingData.budget * 0.1,
    miscellaneous: weddingData.budget * 0.15
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-600 transition-colors">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400"></div>
                <div>
                  <h1 className="text-base text-gray-800 dark:text-white">
                    {t.planner.welcome}
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <LanguageToggle language={language} onToggle={toggleLanguage} />
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 border border-gray-200 dark:border-gray-600"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps - Only show when not on welcome screen */}
      {step > 0 && (
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-6">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNum 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {step > stepNum ? <CheckCircle className="w-4 h-4" /> : 
                     stepNum === 1 ? <Sparkles className="w-4 h-4" /> :
                     stepNum === 2 ? <Users className="w-4 h-4" /> :
                     stepNum === 3 ? <MapPin className="w-4 h-4" /> :
                     <CheckCircle className="w-4 h-4" />}
                  </div>
                  {stepNum < 4 && (
                    <div className={`w-8 h-1 ${
                      step > stepNum ? 'bg-rose-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 transition-colors p-8">
          {step === 0 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {t.planner.welcome}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-200 mb-10">
                {t.planner.welcomeDesc}
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="text-3xl mb-3">1️⃣</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    {language === 'id' ? 'Lengkapi Informasi' : 'Fill Information'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-200">
                    {language === 'id' 
                      ? 'Jumlah tamu, budget, dan preferensi venue'
                      : 'Guest count, budget, and venue preferences'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="text-3xl mb-3">2️⃣</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    {language === 'id' ? 'Dapatkan Rekomendasi' : 'Get Recommendations'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-200">
                    {language === 'id' 
                      ? 'Rekomendasi venue dan vendor AI-powered'
                      : 'AI-powered venue and vendor recommendations'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="text-3xl mb-3">3️⃣</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    {language === 'id' ? 'Rencana Siap!' : 'Plan Ready!'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-200">
                    {language === 'id' 
                      ? 'Simpan, ekspor, dan bagikan rencana Anda'
                      : 'Save, export, and share your plan'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                {t.planner.startPlanning}
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-2xl">
                  <Heart className="w-12 h-12 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                {t.planner.welcome}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-200 mb-8">
                {t.planner.welcomeDesc}
              </p>
              <button
                onClick={() => setStep(2)}
                className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                {t.planner.startPlanning}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-rose-500" />
                {t.planner.guestCount.replace('?', '')}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Guest Count */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-rose-500" />
                    <h3 className="font-semibold text-gray-800 dark:text-white">{t.planner.guestCount}</h3>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={weddingData.guestCount}
                    onChange={(e) => updateWeddingData('guestCount', parseInt(e.target.value))}
                    className="w-full mb-2"
                  />
                  <div className="text-center text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" />
                    {weddingData.guestCount} {t.common.guests}
                  </div>
                </div>

                {/* Budget */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-5 h-5 text-rose-500" />
                    <h3 className="font-semibold text-gray-800 dark:text-white">{t.planner.budget}</h3>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="50000"
                    step="1000"
                    value={weddingData.budget}
                    onChange={(e) => updateWeddingData('budget', parseInt(e.target.value))}
                    className="w-full mb-2"
                  />
                  <div className="text-center text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2">
                    <CurrencyDisplay amount={weddingData.budget} />
                  </div>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                    {language === 'id' 
                      ? `1 USD = Rp ${USD_TO_IDR_RATE.toLocaleString('id-ID')}`
                      : `1 USD = Rp ${USD_TO_IDR_RATE.toLocaleString()}`}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Venue Type */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    <h3 className="font-semibold text-gray-800 dark:text-white">{t.planner.venueType}</h3>
                  </div>
                  <select
                    value={weddingData.venueType}
                    onChange={(e) => updateWeddingData('venueType', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white transition-colors"
                  >
                    <option value="beach">{t.planner.beach}</option>
                    <option value="villa">{t.planner.villa}</option>
                    <option value="resort">{t.planner.resort}</option>
                  </select>
                </div>

                {/* Season */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    <h3 className="font-semibold text-gray-800 dark:text-white">{t.planner.season}</h3>
                  </div>
                  <select
                    value={weddingData.season}
                    onChange={(e) => updateWeddingData('season', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white transition-colors"
                  >
                    <option value="april-october">{t.planner.drySeason}</option>
                    <option value="november-march">{t.planner.wetSeason}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.planner.back}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
                >
                  {t.planner.continue}
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-rose-500" />
                  {t.planner.venueRecommendations}
                </h2>
                {aiRecommendations?.source === 'ai' && (
                  <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Powered
                  </span>
                )}
              </div>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-6">
                {language === 'id' 
                  ? `1 USD = Rp ${USD_TO_IDR_RATE.toLocaleString('id-ID')}`
                  : `1 USD = Rp ${USD_TO_IDR_RATE.toLocaleString()}`}
              </p>

              {loadingRecommendations ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-200">
                      {language === 'id' ? 'Mencari rekomendasi terbaik...' : 'Finding the best recommendations...'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {aiRecommendations?.recommendations && (
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 p-6 rounded-xl mb-6 border border-rose-200 dark:border-rose-800">
                      <p className="text-gray-700 dark:text-gray-100 mb-2">
                        <span className="font-semibold">{language === 'id' ? 'Terbaik untuk:' : 'Best for:'}</span> {aiRecommendations.recommendations.bestFor}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-200">
                        {aiRecommendations.recommendations.priority}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {getCurrentVenueRecommendations().map((venue, index) => (
                      <div key={venue.id || index} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border-2 border-transparent hover:border-rose-300 dark:hover:border-rose-700 transition-colors group relative">
                        {venue.matchScore && venue.matchScore >= 90 && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            {venue.matchScore}% Match
                          </div>
                        )}
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{venue.name}</h3>
                        {venue.location && (
                          <p className="text-xs text-gray-500 dark:text-gray-200 mb-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {venue.location}
                          </p>
                        )}
                        <p className="text-rose-600 dark:text-rose-400 font-semibold mb-2">
                          {formatCurrency(venue.price)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-200 mb-2 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {venue.guests} {t.common.guests}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-200">{venue.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {aiRecommendations?.budgetTips && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl mb-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    {language === 'id' ? 'Tips Optimasi Budget AI' : 'AI Budget Optimization Tips'}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-100 whitespace-pre-line">{aiRecommendations.budgetTips}</p>
                </div>
              )}

              {aiRecommendations?.vendorSuggestions && aiRecommendations.vendorSuggestions.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl mb-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-purple-500" />
                    {language === 'id' ? 'Rekomendasi Vendor AI' : 'AI Vendor Recommendations'}
                  </h3>
                  <ul className="space-y-2">
                    {aiRecommendations.vendorSuggestions.map((vendor, idx) => (
                      <li key={idx} className="text-gray-700 dark:text-gray-100 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>{vendor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiRecommendations?.timelineAdvice && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl mb-6 border border-amber-200 dark:border-amber-800">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    {language === 'id' ? 'Saran Timeline AI' : 'AI Timeline Advice'}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-100">{aiRecommendations.timelineAdvice}</p>
                </div>
              )}

              <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-rose-500" />
                    {t.planner.budgetBreakdown}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'id' 
                      ? `1 USD = Rp ${USD_TO_IDR_RATE.toLocaleString('id-ID')}`
                      : `1 USD = Rp ${USD_TO_IDR_RATE.toLocaleString()}`}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-200">
                      <MapPin className="w-4 h-4" />
                      {t.planner.venue}:
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {formatCurrency(budgetBreakdown.venue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-200">
                      <Utensils className="w-4 h-4" />
                      {t.planner.catering}:
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {formatCurrency(budgetBreakdown.catering)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-200">
                      <Camera className="w-4 h-4" />
                      {t.planner.photography}:
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {formatCurrency(budgetBreakdown.photography)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-200">
                      <Palette className="w-4 h-4" />
                      {t.planner.decoration}:
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {formatCurrency(budgetBreakdown.decoration)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-200">
                      <Gift className="w-4 h-4" />
                      {t.planner.miscellaneous}:
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {formatCurrency(budgetBreakdown.miscellaneous)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={loadSavedPlan}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                  title={t.planner.loadPlan}
                >
                  <Upload className="w-4 h-4" />
                  {t.planner.loadPlan}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t.planner.back}
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    {t.planner.continueTimeline}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center" id="plan-summary">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {t.planner.planReady}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-200 mb-2">
                {language === 'en' 
                  ? `${t.planner.planReadyDesc} ${weddingData.guestCount} ${t.common.guests} with a ${formatCurrency(weddingData.budget)} budget.`
                  : `${t.planner.planReadyDesc} ${weddingData.guestCount} ${t.common.guests} dengan budget ${formatCurrency(weddingData.budget)}.`
                }
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                {language === 'id' 
                  ? `1 USD = Rp ${USD_TO_IDR_RATE.toLocaleString('id-ID')}`
                  : `1 USD = Rp ${USD_TO_IDR_RATE.toLocaleString()}`}
              </p>
              
              <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-xl mb-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2 justify-center">
                  <Star className="w-5 h-5 text-rose-500" />
                  {t.planner.nextSteps}
                </h3>
                <div className="space-y-3 text-left max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    <span className="text-gray-700 dark:text-gray-100">{t.planner.contactVenues}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    <span className="text-gray-700 dark:text-gray-100">{t.planner.saveDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-rose-500" />
                    <span className="text-gray-700 dark:text-gray-100">{t.planner.finalizeGuests}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center flex-wrap mb-6">
                <Link 
                  href={{
                    pathname: '/chat',
                    query: {
                      fromPlanner: 'true',
                      guestCount: weddingData.guestCount.toString(),
                      budget: weddingData.budget.toString(),
                      venueType: weddingData.venueType,
                      season: weddingData.season
                    }
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t.planner.getAdvice}
                </Link>
                <button
                  onClick={() => setStep(1)}
                  className="border border-rose-500 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {t.planner.startOver}
                </button>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={savePlan}
                  className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  title={t.planner.savePlan}
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={exportToPDF}
                  className="p-3 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors"
                  title={t.planner.exportPDF}
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={sharePlan}
                  className="p-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                  title={t.planner.sharePlan}
                >
                  {linkCopied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    }>
      <PlannerPageContent />
    </Suspense>
  );
}