// app/admin/content/page.tsx - Content Management
'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Sparkles, 
  Lightbulb, 
  FileText,
  X,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

type ContentType = 'prompts' | 'tips' | 'posts';

interface AIPrompt {
  id: string;
  name: string;
  category: string;
  prompt_text: string;
  variables: any;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

interface WeddingTip {
  id: string;
  title: string;
  content: string;
  category: string;
  language: string;
  display_order: number;
  is_active: boolean;
  image_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  category: string;
  language: string;
  is_published: boolean;
  published_at?: string;
  view_count: number;
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

function ContentManagementContent() {
  const [activeTab, setActiveTab] = useState<ContentType>('prompts');
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [tips, setTips] = useState<WeddingTip[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadContent = async () => {
    try {
      setLoading(true);
      if (activeTab === 'prompts') {
        const { data, error } = await supabase
          .from('ai_prompts')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPrompts(data || []);
      } else if (activeTab === 'tips') {
        const { data, error } = await supabase
          .from('wedding_tips')
          .select('*')
          .order('display_order', { ascending: true });
        if (error) throw error;
        setTips(data || []);
      } else if (activeTab === 'posts') {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPosts(data || []);
      }
    } catch (error: any) {
      console.error('Error loading content:', error);
      alert('Error loading content: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: ContentType) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      let tableName = '';
      if (type === 'prompts') tableName = 'ai_prompts';
      else if (type === 'tips') tableName = 'wedding_tips';
      else if (type === 'posts') tableName = 'blog_posts';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadContent();
      alert('Item deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting item:', error);
      alert('Error deleting item: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEdit = (item: any, type: ContentType) => {
    setEditingItem(item.id);
    setFormData(item);
    setShowForm(true);
  };

  const handleCreate = (type: ContentType) => {
    setEditingItem(null);
    if (type === 'prompts') {
      setFormData({
        name: '',
        category: 'chat',
        prompt_text: '',
        variables: null,
        is_active: true,
        version: 1
      });
    } else if (type === 'tips') {
      setFormData({
        title: '',
        content: '',
        category: 'budget',
        language: 'en',
        display_order: 0,
        is_active: true,
        image_url: '',
        tags: []
      });
    } else if (type === 'posts') {
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image_url: '',
        category: 'planning',
        language: 'en',
        is_published: false,
        tags: [],
        seo_title: '',
        seo_description: ''
      });
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      let tableName = '';
      if (activeTab === 'prompts') tableName = 'ai_prompts';
      else if (activeTab === 'tips') tableName = 'wedding_tips';
      else if (activeTab === 'posts') tableName = 'blog_posts';

      // Generate slug for blog posts if creating new
      if (activeTab === 'posts' && !editingItem && !formData.slug) {
        formData.slug = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      if (editingItem) {
        // Update
        const { error } = await supabase
          .from(tableName)
          .update(formData)
          .eq('id', editingItem);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from(tableName)
          .insert([formData]);
        if (error) throw error;
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData({});
      loadContent();
      alert(editingItem ? 'Item updated successfully!' : 'Item created successfully!');
    } catch (error: any) {
      console.error('Error saving item:', error);
      alert('Error saving item: ' + (error.message || 'Unknown error'));
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      let tableName = '';
      let fieldName = '';
      if (activeTab === 'prompts') {
        tableName = 'ai_prompts';
        fieldName = 'is_active';
      } else if (activeTab === 'tips') {
        tableName = 'wedding_tips';
        fieldName = 'is_active';
      } else if (activeTab === 'posts') {
        tableName = 'blog_posts';
        fieldName = 'is_published';
      }

      const { error } = await supabase
        .from(tableName)
        .update({ [fieldName]: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadContent();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      alert('Error updating status: ' + (error.message || 'Unknown error'));
    }
  };

  if (loading && !showForm) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage AI prompts, wedding tips, and blog posts
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'prompts' as ContentType, label: 'AI Prompts', icon: Sparkles },
            { id: 'tips' as ContentType, label: 'Wedding Tips', icon: Lightbulb },
            { id: 'posts' as ContentType, label: 'Blog Posts', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content List */}
      {!showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeTab === 'prompts' && 'AI Prompts'}
              {activeTab === 'tips' && 'Wedding Tips'}
              {activeTab === 'posts' && 'Blog Posts'}
            </h2>
            <button
              onClick={() => handleCreate(activeTab)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New
            </button>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activeTab === 'prompts' && (
              prompts.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No prompts found. Create your first prompt!
                </div>
              ) : (
                prompts.map((prompt) => (
                  <div key={prompt.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {prompt.name}
                          </h3>
                          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
                            {prompt.category}
                          </span>
                          {prompt.is_active ? (
                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {prompt.prompt_text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Version {prompt.version} • Updated {new Date(prompt.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleActive(prompt.id, prompt.is_active)}
                          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                          title={prompt.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {prompt.is_active ? (
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(prompt, 'prompts')}
                          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(prompt.id, 'prompts')}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'tips' && (
              tips.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No tips found. Create your first tip!
                </div>
              ) : (
                tips.map((tip) => (
                  <div key={tip.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {tip.title}
                          </h3>
                          <span className="px-2 py-1 text-xs font-semibold bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded">
                            {tip.category}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            {tip.language.toUpperCase()}
                          </span>
                          {tip.is_active ? (
                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {tip.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleActive(tip.id, tip.is_active)}
                          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                          title={tip.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {tip.is_active ? (
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(tip, 'tips')}
                          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(tip.id, 'tips')}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'posts' && (
              posts.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No blog posts found. Create your first post!
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {post.title}
                          </h3>
                          <span className="px-2 py-1 text-xs font-semibold bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded">
                            {post.category}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            {post.language.toUpperCase()}
                          </span>
                          {post.is_published ? (
                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded">
                              Draft
                            </span>
                          )}
                        </div>
                        {post.excerpt && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Slug: {post.slug} • Views: {post.view_count} • {new Date(post.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleActive(post.id, post.is_published)}
                          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                          title={post.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {post.is_published ? (
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(post, 'posts')}
                          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, 'posts')}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit' : 'Create New'} {activeTab === 'prompts' && 'AI Prompt'}
                {activeTab === 'tips' && 'Wedding Tip'}
                {activeTab === 'posts' && 'Blog Post'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  setFormData({});
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {activeTab === 'prompts' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., default_chat"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category || 'chat'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="chat">Chat</option>
                      <option value="recommendations">Recommendations</option>
                      <option value="planner">Planner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prompt Text *
                    </label>
                    <textarea
                      value={formData.prompt_text || ''}
                      onChange={(e) => setFormData({ ...formData, prompt_text: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter the AI prompt text..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active_prompt"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_active_prompt" className="text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'tips' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Budget Planning Tips"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter tip content..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category || 'budget'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="budget">Budget</option>
                        <option value="venue">Venue</option>
                        <option value="timeline">Timeline</option>
                        <option value="vendor">Vendor</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language *
                      </label>
                      <select
                        value={formData.language || 'en'}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="en">English</option>
                        <option value="id">Indonesian</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.display_order || 0}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active_tip"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_active_tip" className="text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                </>
              )}

              {activeTab === 'posts' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Ultimate Bali Wedding Guide"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., ultimate-bali-wedding-guide"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={formData.excerpt || ''}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Short description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={12}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="Enter blog post content (supports markdown)..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category || 'planning'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="planning">Planning</option>
                        <option value="tips">Tips</option>
                        <option value="venues">Venues</option>
                        <option value="real-weddings">Real Weddings</option>
                        <option value="vendor">Vendor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language *
                      </label>
                      <select
                        value={formData.language || 'en'}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="en">English</option>
                        <option value="id">Indonesian</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_published_post"
                      checked={formData.is_published ?? false}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_published_post" className="text-sm text-gray-700 dark:text-gray-300">
                      Published
                    </label>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    setFormData({});
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentManagement() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    }>
      <ContentManagementContent />
    </Suspense>
  );
}

