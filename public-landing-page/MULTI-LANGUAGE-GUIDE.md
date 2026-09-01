# Multi-Language Support Guide

## ✅ SETUP COMPLETE

Multi-language support has been successfully integrated into CivicPath using `next-intl`.

## 🌍 Supported Languages

- **English** (en) - Default
- **Hindi** (हिंदी) - hi
- **Kannada** (ಕನ್ನಡ) - kn

## 📁 Files Created/Modified

### Configuration Files
- `src/middleware.ts` - Handles locale detection and routing
- `src/i18n.ts` - i18n configuration with cookie-based locale
- `src/app/layout.tsx` - Wrapped with NextIntlClientProvider

### Translation Files
- `messages/en.json` - English translations
- `messages/hi.json` - Hindi translations
- `messages/kn.json` - Kannada translations

### Components
- `src/components/LanguageSwitcher.tsx` - Language selection dropdown
- `src/components/layout/CitizenLayout.tsx` - Added LanguageSwitcher to header

## 🎯 How It Works

1. **No URL Changes**: Language preference is stored in a cookie (`NEXT_LOCALE`)
2. **Automatic Detection**: Middleware reads the cookie and loads the correct translations
3. **Easy Switching**: Click the language switcher (Globe icon) in the header
4. **Instant Update**: Page refreshes with new language after selection

## 🔧 How to Use Translations in Your Components

### 1. Client Components (with "use client")

```tsx
"use client";
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('citizen');
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('reportIssue')}</p>
    </div>
  );
}
```

### 2. Server Components

```tsx
import { useTranslations } from 'next-intl';

export default async function MyServerComponent() {
  const t = await useTranslations('citizen');
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
    </div>
  );
}
```

### 3. Nested Translation Keys

```tsx
const t = useTranslations('home.hero');

<h1>{t('title')}</h1>
<p>{t('description')}</p>
```

## 📝 Translation Structure

```json
{
  "common": {
    "appName": "CivicPath",
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "home": {
    "hero": {
      "title": "Your Voice for a",
      "titleHighlight": "Better Constituency"
    }
  },
  "citizen": {
    "welcome": "Welcome to CivicPath",
    "reportIssue": "Report a Civic Issue"
  }
}
```

## 🎨 Example: Converting Existing Component

### Before (Hardcoded Text)
```tsx
export default function Page() {
  return (
    <div>
      <h1>Welcome to CivicPath</h1>
      <button>Report Issue</button>
    </div>
  );
}
```

### After (With Translations)
```tsx
"use client";
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('citizen');
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('reportIssue')}</button>
    </div>
  );
}
```

## 🚀 Testing

1. **Start the dev server**: `npm run dev`
2. **Open**: http://localhost:3000
3. **Look for**: Globe icon (🌐) in the top navigation
4. **Click**: Select Hindi or Kannada
5. **Result**: Page refreshes with new language

## 📦 Adding New Translations

### Step 1: Add to English (messages/en.json)
```json
{
  "mySection": {
    "newKey": "New Text in English"
  }
}
```

### Step 2: Add to Hindi (messages/hi.json)
```json
{
  "mySection": {
    "newKey": "हिंदी में नया पाठ"
  }
}
```

### Step 3: Add to Kannada (messages/kn.json)
```json
{
  "mySection": {
    "newKey": "ಕನ್ನಡದಲ್ಲಿ ಹೊಸ ಪಠ್ಯ"
  }
}
```

### Step 4: Use in Component
```tsx
const t = useTranslations('mySection');
<p>{t('newKey')}</p>
```

## 🎯 Current Status

✅ Package installed (`next-intl`)
✅ Middleware configured
✅ i18n setup with cookie-based locale
✅ Layout wrapped with provider
✅ LanguageSwitcher component created
✅ Added to CitizenLayout header
✅ Translation files created for 3 languages
✅ Server running successfully

## 📋 Next Steps (Optional)

1. **Convert More Pages**: Update other pages to use translations
2. **Add More Languages**: Create new JSON files (e.g., `messages/te.json` for Telugu)
3. **Dynamic Content**: Add translations for form labels, error messages, etc.
4. **Add to Other Layouts**: Include LanguageSwitcher in Officer, Admin, MLA layouts

## 🔍 Where is the Language Switcher?

The language switcher (Globe icon 🌐) is located in:
- **Desktop**: Top navigation bar, between the nav links and MLA portrait
- **Mobile**: Inside the mobile menu (hamburger menu)

## 🐛 Troubleshooting

### Language not changing?
- Check browser console for errors
- Verify cookie is being set (DevTools → Application → Cookies)
- Ensure all translation files have the same keys

### Missing translations?
- Check that the key exists in all language files
- Verify the translation path (e.g., 'home.hero.title')
- Look for typos in key names

### Build errors?
- Run `npm run build` to check for issues
- Ensure all JSON files are valid
- Check that middleware.ts is in the correct location

## 📚 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Guide](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

---

**Status**: ✅ Multi-language support is LIVE and ready to use!
