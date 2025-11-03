# 🔧 Fix Email Links - Update Supabase Redirect URLs

**Masalah:** Email confirmation links masih menggunakan `http://localhost:3000/` 
**Solusi:** Update Site URL dan Redirect URLs di Supabase Dashboard

## 📝 Langkah-Langkah:

### 1. Update Site URL

1. Buka: **https://supabase.com/dashboard**
2. Pilih project: **xonqvbehrqgmlqnygeou**
3. Buka: **Settings** → **Authentication** → **URL Configuration**
4. Update **Site URL**:
   ```
   https://wedding-ai-assistant-l1u6ccrcc-kkdev20s-projects.vercel.app
   ```
5. Klik **Save**

### 2. Update Redirect URLs

Di halaman yang sama (Authentication → URL Configuration), scroll ke **Redirect URLs**

1. Klik **Add URL**
2. Tambahkan URL berikut (satu per satu):
   ```
   https://wedding-ai-assistant-l1u6ccrcc-kkdev20s-projects.vercel.app/**
   https://wedding-ai-assistant-l1u6ccrcc-kkdev20s-projects.vercel.app/admin/login
   https://wedding-ai-assistant-l1u6ccrcc-kkdev20s-projects.vercel.app/auth/callback
   ```
3. Hapus `http://localhost:3000/**` jika tidak diperlukan
4. Klik **Save**

### 3. Update Email Templates (Optional)

Jika ingin customize email templates:

1. Buka: **Authentication** → **Email Templates**
2. Pilih template (Confirm signup, Reset password, dll)
3. Pastikan link menggunakan `{{ .SiteURL }}` atau `{{ .RedirectTo }}`
4. Supabase akan otomatis menggunakan Site URL yang sudah di-set di step 1

## ✅ Setelah Update:

1. Test registrasi user baru
2. Cek email yang masuk - link harus menggunakan production URL
3. Klik link di email - harus redirect ke production site

## 🔍 Verifikasi:

Setelah update, email confirmation links akan menggunakan:
- **Before:** `http://localhost:3000/auth/callback?token=...`
- **After:** `https://wedding-ai-assistant-l1u6ccrcc-kkdev20s-projects.vercel.app/auth/callback?token=...`

---

**Note:** Jika auto-confirm email sudah enabled (via SQL trigger), email mungkin tidak dikirim. Tapi redirect URLs tetap perlu di-update untuk consistency.

