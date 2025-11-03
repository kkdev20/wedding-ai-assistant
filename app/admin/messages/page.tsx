// app/admin/messages/page.tsx - Chat Messages Management
'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { Search, MessageCircle, User, Bot, Calendar } from 'lucide-react';

interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  context: any;
  created_at: string;
  profiles?: {
    email: string;
    name: string | null;
  };
}

function MessagesManagementContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'assistant'>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles:user_id (
            email,
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      alert('Error loading messages');
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || msg.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat Messages</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and manage all chat messages
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {messages.length}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">User Messages</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {messages.filter(m => m.role === 'user').length}
              </p>
            </div>
            <User className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Responses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {messages.filter(m => m.role === 'assistant').length}
              </p>
            </div>
            <Bot className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterRole === 'all'
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRole('user')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterRole === 'user'
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              User
            </button>
            <button
              onClick={() => setFilterRole('assistant')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterRole === 'assistant'
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              AI
            </button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredMessages.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {messages.length === 0 
                    ? 'No chat messages yet' 
                    : 'No messages match your search'}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    message.role === 'user' 
                      ? 'bg-blue-50/50 dark:bg-blue-900/10' 
                      : 'bg-purple-50/50 dark:bg-purple-900/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-purple-500 text-white'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-semibold ${
                            message.role === 'user'
                              ? 'text-blue-700 dark:text-blue-400'
                              : 'text-purple-700 dark:text-purple-400'
                          }`}>
                            {message.role === 'user' 
                              ? message.profiles?.email || message.profiles?.name || 'User'
                              : 'AI Assistant'
                            }
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            message.role === 'user'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          }`}>
                            {message.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(message.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      {message.context && (
                        <details className="mt-2 text-xs">
                          <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            View Context
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                            {JSON.stringify(message.context, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesManagement() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    }>
      <MessagesManagementContent />
    </Suspense>
  );
}



