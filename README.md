# Prism

Prism is a nutrition app that tells you whether a food actually fits *your* goals — not a generic label. Scan a barcode or log a meal, and Prism gives you a personalized, LLM-generated assessment based on your goals, activity level, and how deep an explanation you want.

## Motivation

I built Prism after watching nutrition misinformation affect people close to me — conflicting advice, misleading packaging, and generic "healthy/unhealthy" labels that ignore who's actually eating the food. Prism is my attempt at something better: a personalized nutrition pipeline that reasons about a specific person's goals. Rather than giving everyone the same verdict, Prism tries to understand in what context certain foods can be used based on the user profile.

It's built end-to-end (mobile app, backend, LLM pipeline) and deployed to real users — my family uses it to check whether a food is healthy for them and to understand what's actually in it.

## How it works

- **Mobile app** (Expo / React Native) — users scan a barcode or log a food manually, set up a profile (goals, activity level, preferred explanation depth, language), and get back a personalized assessment: macros, an AI-written review, and whether the food supports their specific goals.
- **Backend** (Next.js API route) — receives the scanned food + user profile, builds a prompt tailored to that user, and calls Gemini to generate a structured, personalized assessment.
- **Caching layer** — assessments are cached in Firestore, keyed by a fingerprint hashed from the *food data + the parts of the user's profile that affect the output* (goals, activity level, explanation depth, language), with list-valued fields normalized so equivalent inputs (e.g. goals listed in a different order) hash identically. This keeps results correct per-user while avoiding redundant model calls for requests that are effectively the same.

```
app/       Expo / React Native mobile app
backend/   Next.js API + Firestore-backed caching + Gemini integration
```

## Tech stack

- **App**: React Native, Expo, React Navigation, `expo-camera` for barcode scanning, on-device storage via AsyncStorage
- **Backend**: Next.js (App Router), Firebase Admin / Firestore, Google Gemini (`@google/genai`)

## Running it locally

### Backend

```bash
cd backend
npm install
cp .env.example .env.local   # fill in GEMINI_API_KEY
# also add your own Firebase serviceAccountKey.json (not committed)
npm run dev
```

### App

```bash
cd app
npm install
npx expo start
```

Point the app's `BACKEND_URL` (`app/src/api.ts`) at wherever the backend is running.
