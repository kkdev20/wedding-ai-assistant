// app/chat/page.tsx - FULLY CLEAN NO EMOJI VERSION
'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft, 
  Sun, 
  Moon,
  Copy,
  Trash2,
  RotateCcw,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { type Language, useTranslations } from '@/lib/translations';
import LanguageToggle from '@/components/LanguageToggle';
import { saveChatMessageToDB, loadChatMessagesFromDB, setupRealtimeMessagesSubscription, getCurrentUser } from '@/lib/db-helpers';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  error?: boolean;
  retryable?: boolean;
}

function getInitialMessage(searchParams: any, lang: Language = 'en') {
  const fromPlanner = searchParams.get('fromPlanner');
  
  if (fromPlanner === 'true') {
    const guestCount = searchParams.get('guestCount');
    const budget = searchParams.get('budget');
    const venueType = searchParams.get('venueType');
    const season = searchParams.get('season');
    
    if (lang === 'id') {
      const venueTypeMap: { [key: string]: string } = {
        beach: 'pantai',
        villa: 'villa pribadi', 
        resort: 'resor mewah'
      };
      
      const seasonMap: { [key: string]: string } = {
        'april-october': 'musim kemarau (April-Oktober)',
        'november-march': 'musim hujan (November-Maret)'
      };

      return `Selamat datang kembali! Saya lihat Anda merencanakan pernikahan Bali yang indah untuk ${guestCount} tamu dengan budget $${parseInt(budget || '0').toLocaleString()}. 

Anda tertarik dengan venue ${venueTypeMap[venueType || 'beach']} selama ${seasonMap[season || 'april-october']}.

Saya dapat membantu Anda dengan:
• Rekomendasi ${venueTypeMap[venueType || 'beach']} spesifik
• Optimasi budget untuk budget $${parseInt(budget || '0').toLocaleString()} Anda
• Koneksi vendor (fotografer, katering, dll.)
• Perencanaan timeline ${seasonMap[season || 'april-october']}
• Manajemen tamu untuk ${guestCount} orang

Apa yang ingin Anda fokuskan terlebih dahulu?`;
    }
    
    // English version
    const venueTypeMap: { [key: string]: string } = {
      beach: 'beach',
      villa: 'private villa', 
      resort: 'luxury resort'
    };
    
    const seasonMap: { [key: string]: string } = {
      'april-october': 'dry season (April-October)',
      'november-march': 'wet season (November-March)'
    };

    return `Welcome back! I see you're planning a beautiful Bali wedding for ${guestCount} guests with a $${parseInt(budget || '0').toLocaleString()} budget. 

You're interested in ${venueTypeMap[venueType || 'beach']} venues during ${seasonMap[season || 'april-october']}.

I can help you with:
• Specific ${venueTypeMap[venueType || 'beach']} recommendations
• Budget optimization for your $${parseInt(budget || '0').toLocaleString()} budget
• Vendor connections (photographers, caterers, etc.)
• ${seasonMap[season || 'april-october']} timeline planning
• Guest management for ${guestCount} people

What would you like to focus on first?`;
  }
  
  if (lang === 'id') {
    return `Halo! Saya adalah Asisten AI Pernikahan Bali Anda!

Saya mengkhususkan diri dalam membantu merencanakan pernikahan Bali yang sempurna. Saya dapat membantu dengan:

Pemilihan Venue - Rekomendasi pantai, villa, atau resort
Perencanaan Budget - Rincian biaya dan tips menghemat uang  
Koneksi Vendor - Fotografer, katering, dekorasi bunga
Pembuatan Timeline - Dari 12 bulan sebelumnya hingga hari pernikahan
Keahlian Lokal - Tradisi dan praktik terbaik Bali

Dari mana Anda ingin memulai? Anda juga bisa memberi tahu saya tentang jumlah tamu dan budget Anda untuk saran yang dipersonalisasi!`;
  }
  
  return `Hello! I'm your Bali Wedding AI Assistant!

I specialize in helping plan perfect Bali weddings. I can assist with:

Venue Selection - Beach, villa, or resort recommendations
Budget Planning - Cost breakdown and money-saving tips  
Vendor Connections - Photographers, caterers, florists
Timeline Creation - From 12 months out to wedding day
Local Expertise - Balinese traditions and best practices

What would you like to start with? You can also tell me about your guest count and budget for personalized advice!`;
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  const t = useTranslations(language);
  // Messages start empty - will be reset on every page refresh/navigation
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [retryMessageId, setRetryMessageId] = useState<string | null>(null);
  const [realtimeSyncActive, setRealtimeSyncActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const CHAT_STORAGE_KEY = 'wedding-chat-history';

  // Load saved language preference
  useEffect(() => {
    setMounted(true);
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
  }, []);

  // Load messages from database (if logged in) or localStorage (fallback)
  useEffect(() => {
    if (!mounted || initializedRef.current) return;
    if (typeof window === 'undefined') return;
    
    const loadMessages = async () => {
      try {
        // Try to load from database first (if user is logged in)
        const dbMessages = await loadChatMessagesFromDB(100);
        
        if (dbMessages && dbMessages.length > 0) {
          // Convert database messages to Message format
          const parsedMessages: Message[] = dbMessages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            timestamp: new Date(msg.created_at),
          }));
          
          // Check if we need to update initial message based on current params
          const fromPlanner = searchParams.get('fromPlanner');
          const expectedInitialMessage = getInitialMessage(searchParams, language);
          const firstMsg = parsedMessages[0];
          const shouldReset = fromPlanner === 'true' && (
            !parsedMessages.length || 
            firstMsg?.role !== 'assistant' ||
            (!firstMsg?.content.includes('Selamat') && !firstMsg?.content.includes('Welcome'))
          );
          
          if (shouldReset || !parsedMessages.length) {
            const initialMessage: Message = {
              id: Date.now().toString(),
              content: expectedInitialMessage,
              role: 'assistant',
              timestamp: new Date()
            };
            setMessages([initialMessage]);
            // Save to both database and localStorage
            await saveChatMessageToDB('assistant', expectedInitialMessage);
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([initialMessage]));
          } else {
            setMessages(parsedMessages);
            // Sync to localStorage as backup
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(parsedMessages));
          }
        } else {
          // No database messages, try localStorage
          const saved = localStorage.getItem(CHAT_STORAGE_KEY);
          if (saved) {
            const savedMessages = JSON.parse(saved);
            // Convert timestamp strings back to Date objects
            const parsedMessages: Message[] = savedMessages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            
            // Check if we need to update initial message based on current params
            const fromPlanner = searchParams.get('fromPlanner');
            const expectedInitialMessage = getInitialMessage(searchParams, language);
            const shouldReset = fromPlanner === 'true' && (
              !parsedMessages.length || 
              parsedMessages[0]?.content !== expectedInitialMessage
            );
            
            if (shouldReset || !parsedMessages.length) {
              const initialMessage: Message = {
                id: Date.now().toString(),
                content: expectedInitialMessage,
                role: 'assistant',
                timestamp: new Date()
              };
              setMessages([initialMessage]);
              await saveChatMessageToDB('assistant', expectedInitialMessage);
              localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([initialMessage]));
            } else {
              setMessages(parsedMessages);
            }
          } else {
            // Initialize with proper message based on searchParams and language
            const initialMessage: Message = {
              id: Date.now().toString(),
              content: getInitialMessage(searchParams, language),
              role: 'assistant',
              timestamp: new Date()
            };
            setMessages([initialMessage]);
            await saveChatMessageToDB('assistant', initialMessage.content);
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([initialMessage]));
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Fallback to localStorage only
        try {
          const saved = localStorage.getItem(CHAT_STORAGE_KEY);
          if (saved) {
            const savedMessages = JSON.parse(saved);
            const parsedMessages: Message[] = savedMessages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            setMessages(parsedMessages);
          } else {
            const initialMessage: Message = {
              id: Date.now().toString(),
              content: getInitialMessage(searchParams, language),
              role: 'assistant',
              timestamp: new Date()
            };
            setMessages([initialMessage]);
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
          const initialMessage: Message = {
            id: Date.now().toString(),
            content: getInitialMessage(searchParams, language),
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages([initialMessage]);
        }
      }
      
      initializedRef.current = true;
    };
    
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]); // Only run once on mount

  // Reset initializedRef when component unmounts to ensure fresh initialization on next mount/refresh
  useEffect(() => {
    return () => {
      initializedRef.current = false;
    };
  }, []);

  // Setup real-time sync for chat messages
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

        console.log('🔄 Setting up real-time sync for chat messages...');
        subscription = setupRealtimeMessagesSubscription(user.id, (newMessage) => {
          console.log('📥 New message via real-time:', newMessage);
          
          // Convert database message to Message format
          const message: Message = {
            id: newMessage.id,
            content: newMessage.content,
            role: newMessage.role as 'user' | 'assistant',
            timestamp: new Date(newMessage.created_at)
          };

          // Add message to list (avoid duplicates by checking ID)
          setMessages(prev => {
            // Check if message already exists (to avoid duplicates from self)
            const exists = prev.some(msg => msg.id === message.id);
            if (exists) {
              console.log('Message already exists, skipping duplicate');
              return prev;
            }
            
            console.log('Adding new message from real-time sync');
            const updated = [...prev, message];
            
            // Sync to localStorage as backup
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
            
            return updated;
          });
        });

        setRealtimeSyncActive(true);
        console.log('✅ Real-time sync active for chat');
      } catch (error) {
        console.error('Error setting up real-time sync:', error);
      }
    };

    setupRealtimeSync();

    // Cleanup on unmount
    return () => {
      if (subscription) {
        console.log('🔌 Unsubscribing from real-time chat updates');
        subscription.unsubscribe();
        setRealtimeSyncActive(false);
      }
    };
  }, [mounted, CHAT_STORAGE_KEY]);

  useEffect(() => {
    if (!mounted) return;
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode, mounted]);

  // Save messages to localStorage whenever messages change (database saves are handled in handleSend)
  useEffect(() => {
    if (!mounted || !initializedRef.current) return;
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history to localStorage:', error);
    }
  }, [messages, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('language', language);
  }, [language, mounted]);

  // Update initial message when language changes (separate effect to avoid conflicts)
  useEffect(() => {
    if (!mounted || !initializedRef.current) return;
    
    const expectedInitialMessage = getInitialMessage(searchParams, language);
    
    // Use functional update to access current messages without dependency
    setMessages(prev => {
      if (prev.length === 0) {
        // If no messages, create initial message
        const initialMessage: Message = {
          id: Date.now().toString(),
          content: expectedInitialMessage,
          role: 'assistant',
          timestamp: new Date()
        };
        try {
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([initialMessage]));
        } catch (error) {
          console.error('Error updating chat history:', error);
        }
        return [initialMessage];
      }
      
      const firstMessage = prev[0];
      
      // Check if first message is the initial greeting by comparing with both language versions
      const initialEn = getInitialMessage(searchParams, 'en');
      const initialId = getInitialMessage(searchParams, 'id');
      
      const isInitialGreeting = firstMessage.role === 'assistant' && (
        firstMessage.content.includes('Halo!') ||
        firstMessage.content.includes('Welcome') ||
        firstMessage.content.includes('Selamat') ||
        firstMessage.content.includes('I can help you with:') ||
        firstMessage.content.includes('Saya dapat membantu Anda dengan:') ||
        firstMessage.content === initialEn ||
        firstMessage.content === initialId ||
        // Check if it's similar to initial message (for cases with planner context)
        (firstMessage.content.includes('guests') && firstMessage.content.includes('budget')) ||
        (firstMessage.content.includes('tamu') && firstMessage.content.includes('budget'))
      );
      
      if (isInitialGreeting && firstMessage.content !== expectedInitialMessage) {
        const updatedInitialMessage: Message = {
          ...firstMessage,
          content: expectedInitialMessage
        };
        
        const updated = [updatedInitialMessage, ...prev.slice(1)];
        
        // Update localStorage
        try {
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Error updating chat history:', error);
        }
        
        return updated;
      }
      
      return prev;
    });
  }, [language, searchParams, mounted]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'id' : 'en');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (retryMessage?: Message) => {
    const messageToSend = retryMessage?.content || input.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: retryMessage?.id || Date.now().toString(),
      content: messageToSend,
      role: 'user',
      timestamp: retryMessage?.timestamp || new Date()
    };

    // If retrying, remove the error message first
    if (retryMessage) {
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== retryMessage.id);
        const lastUserIndex = filtered.findLastIndex(msg => msg.role === 'user');
        if (lastUserIndex >= 0) {
          // Remove the error response after the user message too
          return filtered.slice(0, lastUserIndex + 1).concat(userMessage);
        }
        return [...filtered, userMessage];
      });
      setRetryMessageId(null);
    } else {
      setMessages(prev => [...prev, userMessage]);
      setInput('');
    }
    
    setIsLoading(true);

    try {
      const fromPlanner = searchParams.get('fromPlanner');
      const context = fromPlanner === 'true' ? {
        fromPlanner: true,
        guestCount: parseInt(searchParams.get('guestCount') || '50'),
        budget: parseInt(searchParams.get('budget') || '10000'),
        venueType: searchParams.get('venueType') || 'beach',
        season: searchParams.get('season') || 'april-october'
      } : undefined;
      
      // Save user message to database immediately
      try {
        await saveChatMessageToDB(
          'user',
          userMessage.content,
          {
            timestamp: userMessage.timestamp,
            context: context
          }
        );
      } catch (dbError) {
        console.error('Error saving user message to database:', dbError);
        // Continue even if database save fails
      }

      // Send conversation history (last 10 messages for context)
      // Include current user message for context
      const currentMessages = retryMessage 
        ? messages.filter(msg => msg.id !== retryMessage.id && msg.role !== 'assistant')
        : messages;
      const conversationHistory = currentMessages
        .slice(-10)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageToSend,
          context: context,
          language: language,
          conversationHistory: conversationHistory
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || t.chat.error,
        role: 'assistant',
        timestamp: new Date(),
        error: false,
        retryable: false
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message to database
      try {
        await saveChatMessageToDB(
          'assistant',
          assistantMessage.content,
          {
            timestamp: assistantMessage.timestamp,
            context: context
          }
        );
      } catch (dbError) {
        console.error('Error saving assistant message to database:', dbError);
        // Continue even if database save fails
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const isTimeout = error.name === 'AbortError';
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: isTimeout 
          ? (language === 'id' 
              ? 'Waktu tunggu habis. Silakan coba lagi atau periksa koneksi internet Anda.'
              : 'Request timed out. Please try again or check your internet connection.')
          : t.chat.connectionError,
        role: 'assistant',
        timestamp: new Date(),
        error: true,
        retryable: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage) {
      handleSend(lastUserMessage);
    }
  };

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm(language === 'id' 
      ? 'Apakah Anda yakin ingin menghapus semua pesan?'
      : 'Are you sure you want to clear all messages?')) {
      const initialMessage: Message = {
        id: Date.now().toString(),
        content: getInitialMessage(searchParams, language),
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([initialMessage]));
      
      // Save initial message to database
      try {
        await saveChatMessageToDB('assistant', initialMessage.content);
      } catch (dbError) {
        console.error('Error saving initial message to database:', dbError);
        // Continue even if database save fails
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-600 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400"></div>
                <div>
                  <h1 className="text-base text-gray-800 dark:text-white">
                    {t.chat.title}
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 border border-gray-200 dark:border-gray-600"
                title={language === 'id' ? 'Hapus chat' : 'Clear chat'}
              >
                <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <LanguageToggle language={language} onToggle={toggleLanguage} />
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-110 border border-gray-200 dark:border-gray-600"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600 transition-colors h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-rose-500 text-white'
                      : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-rose-500 text-white rounded-br-none'
                      : message.error
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-bl-none border border-red-200 dark:border-red-800'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-xs ${
                      message.role === 'user' ? 'text-rose-200' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="flex items-center gap-2">
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => handleCopy(message.content, message.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title={language === 'id' ? 'Salin pesan' : 'Copy message'}
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                      {message.error && message.retryable && (
                        <button
                          onClick={handleRetry}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex items-center gap-1 text-xs"
                          title={language === 'id' ? 'Coba lagi' : 'Retry'}
                        >
                          <RotateCcw className="w-3 h-3" />
                          {language === 'id' ? 'Coba Lagi' : 'Retry'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-none p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-600 p-6 transition-colors">
            <div className="flex gap-4">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.chat.placeholder}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white transition-colors"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="self-end px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-400 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {t.chat.send}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center transition-colors">
              {t.chat.footer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}