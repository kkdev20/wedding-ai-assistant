# ⚡ Quick Fix: Set Environment Variables

**Masalah:** Login admin & daftar user tidak bisa karena environment variables belum di-set.

## 🚀 Solusi Cepat:

### Option 1: Via CLI (Paling Cepat)

Jalankan perintah berikut satu per satu. CLI akan meminta input value:

```bash
# 1. Set Supabase URL (dari Supabase Dashboard → Settings → API → Project URL)
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# 2. Set Supabase Anon Key (dari Supabase Dashboard → Settings → API → anon public)
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# 3. Set Service Role Key (dari Supabase Dashboard → Settings → API → service_role)
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 4. Set OpenAI Key (dari https://platform.openai.com/api-keys)
vercel env add OPENAI_API_KEY production
```

Setiap command akan menanyakan:
- **Value:** Paste value dari `.env.local` atau dashboard
- **Environment:** Pilih `Production`, `Preview`, dan `Development`

Setelah semua di-set, **redeploy:**
```bash
vercel --prod
```

### Option 2: Via Dashboard

1. Buka: https://vercel.com/kkdev20s-projects/wedding-ai-assistant/settings/environment-variables
2. Klik **"Add New"** untuk setiap variable
3. Copy-paste values dari `.env.local` file
4. Set untuk semua environments
5. Redeploy dari dashboard

### 📝 Cara Ambil Values:

**Jika punya `.env.local` di local:**
- Buka file `.env.local` di project root
- Copy values untuk 4 variables di atas

**Jika tidak punya `.env.local`:**

**Supabase:**
1. Buka https://supabase.com/dashboard
2. Pilih project → Settings → API
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

**OpenAI:**
1. Buka https://platform.openai.com/api-keys
2. Create new key atau copy existing → `OPENAI_API_KEY`

### ✅ Setelah Set Variables & Redeploy:

1. Test login admin di: https://wedding-ai-assistant-m10aasfrc-kkdev20s-projects.vercel.app/admin/login
2. Test daftar user di homepage
3. Semua harus berfungsi!

---

**Current URL:** https://wedding-ai-assistant-m10aasfrc-kkdev20s-projects.vercel.app

