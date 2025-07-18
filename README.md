# 🧠 Smartpedi – Your Smart Parenting Assistant

Smartpedi – bu zamonaviy ota-onalarga mo‘ljallangan aqlli yordamchi ilova bo‘lib, farzandingizning rivojlanish bosqichlarini kuzatish, testlar orqali baholash va foydali tavsiyalar olish imkonini beradi.

## ✨ Asosiy imkoniyatlar

- 👶 **Rivojlanish bosqichlari (Developmental Milestones)**: Har bir yosh davri uchun farzandning jismoniy va aqliy rivojlanishini kuzatish.
- 🧪 **Intellektual testlar**: Admin tomonidan yaratilgan testlarni ota-onalar bajara oladi.
- 📊 **Natijalar va tahlillar**: Test natijalari asosida tahlil va takliflar.
- 👥 **Ko‘p foydalanuvchi rollari**: `Admin`, `Parent` rollari mavjud.

## 🔧 Texnologiyalar

- **Frontend**: React + Tailwind CSS
- **Backend**: Supabase (Auth, Database, API)
- **Realtime**: Supabase Realtime + Subscription
- **Storage**: Supabase File Storage

## 📱 Ekran tasvirlari

| Dashboard (Parent) | Test ishlash | Admin Panel |
|--------------------|--------------|-------------|
| ![Dashboard](screens/dashboard.png) | ![Test](screens/test.png) | ![Admin](screens/admin.png) |

## 🚀 Boshlash (Development)

```bash
git clone https://github.com/username/smartpedi.git
cd smartpedi
npm install
npm run dev
```

## 📱 Mobil Ilova (Android/iOS)

### Android APK Build
```bash
# Dependencies o'rnatish
npm install

# Web build
npm run build

# Capacitor setup
npx cap add android
npx cap sync android

# Android Studio'da ochish
npx cap open android

# Yoki command line orqali build
npm run android:build
```

### iOS Build
```bash
# iOS platform qo'shish
npx cap add ios
npx cap sync ios

# Xcode'da ochish
npx cap open ios

# Yoki command line orqali build
npm run ios:build
```

## 🔧 Codemagic.io Setup

1. **Repository ulash**: GitHub/GitLab repository'ni Codemagic'ga ulang
2. **Workflow tanlash**: `codemagic.yaml` fayli avtomatik taniladi
3. **Environment variables**: Firebase config va signing certificates qo'shing
4. **Build boshlash**: Push qilganingizda avtomatik build boshlanadi

### Kerakli Environment Variables:
```
GOOGLE_SERVICES_JSON (Android)
FIREBASE_CONFIG_JSON (iOS)
KEYSTORE_PASSWORD (Android signing)
KEY_ALIAS (Android signing)
KEY_PASSWORD (Android signing)
```

## 🌐 Netlify'da Deploy qilish

### 1. Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

### 2. SPA Routing uchun
Loyiha avtomatik ravishda `_redirects` fayli yaratadi. Agar manual qo'shish kerak bo'lsa:

```bash
# Build qilgandan keyin
npm run build:netlify
```

### 3. Environment Variables
Netlify dashboard'da quyidagi environment variables'larni qo'shing:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Muammolarni hal qilish

**404 xatolari:**
- `_redirects` fayli `public/` papkasida bo'lishi kerak
- Build command to'g'ri ishlaganini tekshiring
- Publish directory `dist` ga o'rnatilganini tasdiqlang

**Routing muammolari:**
- Browser'da to'g'ridan-to'g'ri URL kiritganda 404 xato
- `netlify.toml` fayli mavjudligini tekshiring
- SPA redirect qoidalari to'g'ri sozlanganini tasdiqlang
