# 💒 Wedding AI Assistant - Bali

A comprehensive wedding planning assistant application built with Next.js, Supabase, and OpenAI integration.

## 🚀 Features

### For Users:
- ✅ **Wedding Planner** - Multi-step planning form with save/load functionality
- ✅ **AI Chat Assistant** - Intelligent wedding planning assistant with OpenAI integration
- ✅ **Venue Recommendations** - AI-powered venue suggestions based on preferences
- ✅ **Real-time Sync** - Sync data across multiple devices/tabs
- ✅ **Multi-language** - English & Indonesian support
- ✅ **Dark Mode** - Beautiful dark/light theme toggle

### For Admins:
- ✅ **Dashboard** - Analytics and statistics
- ✅ **Users Management** - View, manage, confirm, and delete users
- ✅ **Venues Management** - Full CRUD for venue data
- ✅ **Plans Management** - View all wedding plans
- ✅ **Content Management** - Manage AI prompts, wedding tips, and blog posts
- ✅ **Analytics** - User stats, metrics, and activity overview

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **AI:** OpenAI GPT-3.5
- **Deployment:** Vercel

## 📦 Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Add your environment variables:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# OPENAI_API_KEY=your_openai_key
```

## 🗄️ Database Setup

1. Run `SUPABASE_SQL_SCRIPTS.sql` in Supabase SQL Editor to create core tables
2. Run `CREATE_CONTENT_TABLES.sql` to create content management tables
3. Configure RLS policies (included in SQL scripts)

## 🚀 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment

### Quick Deploy to Vercel:

**Repository sudah di GitHub:** `https://github.com/kkdev20/wedding-ai-assistant.git`

#### Steps:

1. **Login ke Vercel:**
   - Buka https://vercel.com
   - Login dengan GitHub account

2. **Import Project:**
   - Klik **"Add New"** → **"Project"**
   - Pilih repository: `kkdev20/wedding-ai-assistant`
   - Klik **"Import"**

3. **Set Environment Variables:**
   - Tambahkan semua variables di bawah ini di Vercel dashboard
   - Pastikan pilih: ✅ Production, ✅ Preview, ✅ Development

4. **Deploy:**
   - Klik **"Deploy"**
   - Tunggu build selesai (~2-5 menit)

📖 **Panduan lengkap:** Lihat `docs/VERCEL_DEPLOYMENT_GUIDE.md`

### Required Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

**💡 Tips:** 
- Semua variables bisa diambil dari `.env.local` di local project
- Supabase keys: Dashboard → Settings → API
- OpenAI key: https://platform.openai.com/api-keys

## 📚 Documentation

- **Setup Guide:** See `docs/SUPABASE_SETUP_GUIDE.md`
- **API Documentation:** See `docs/API_DOCUMENTATION.md`
- **Deployment Guide:** See `docs/DEPLOYMENT_CLEANUP.md`

## 📁 Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── chat/              # AI chat page
│   ├── planner/           # Wedding planner page
│   └── venues/            # Venues pages
├── components/             # React components
├── lib/                    # Utilities & helpers
│   ├── supabase-browser.ts # Supabase client (browser)
│   ├── supabase-server.ts # Supabase client (server)
│   └── db-helpers.ts      # Database helper functions
├── public/                 # Static assets
└── docs/                   # Documentation archive
```

## 🔐 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Admin-only routes protection
- ✅ User data isolation
- ✅ Secure authentication with Supabase Auth
- ✅ Service role key for admin operations only

## ✅ Status

**All 14 modules complete and production-ready!**

- ✅ Backend: 7/7 modules
- ✅ Admin: 7/7 modules

## 📝 License

MIT

## 👨‍💻 Author

Built with ❤️ for Bali wedding planning
