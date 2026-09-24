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
app/         Expo / React Native mobile app
backend/     Next.js API + Firestore-backed caching + Gemini integration
backend-py/  FastAPI port of the backend, containerized for AWS
```

The backend was first written in Next.js and then ported to FastAPI. Both expose the same `POST /api/analyze` contract (`{success, source, data}`) and share the same Firestore cache, so the app works against either one by changing `BACKEND_URL`.

## Tech stack

- **App**: React Native, Expo, React Navigation, `expo-camera` for barcode scanning, on-device storage via AsyncStorage
- **Backend**: Next.js (App Router), Firebase Admin / Firestore, Google Gemini (`@google/genai`)
- **Backend (FastAPI)**: FastAPI, Pydantic, `google-cloud-firestore`, `google-genai`, Docker

## Running it locally

### Backend

```bash
cd backend
npm install
cp .env.example .env.local   # fill in GEMINI_API_KEY
# also add your own Firebase serviceAccountKey.json (not committed)
npm run dev
```

### Backend (FastAPI)

```bash
cd backend-py
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env         # fill in GEMINI_API_KEY
# also add your own serviceAccountKey.json (not committed)
uvicorn app.main:app --host 0.0.0.0 --port 3000 --env-file .env
```

### App

```bash
cd app
npm install
npx expo start
```

Point the app's `BACKEND_URL` (`app/src/api.ts`) at wherever the backend is running.

## FastAPI backend

`backend-py/` is organized so the request flow stays in one small route and each concern lives in its own module:

```
app/
  main.py              FastAPI app, /api router, health check
  routes/analyze.py    POST /api/analyze: fingerprint -> cache lookup -> Gemini on miss -> store
  services/
    fingerprint.py     SHA-256 cache key from the food data + profile fields
    cache.py           Firestore get/set
    gemini.py          Gemini call, JSON output parsing
  prompts.py           system prompt and per-request prompt builder
  schemas.py           Pydantic request models
  config.py            settings from environment variables
```

Notes on the port:

- **Cache-key compatibility.** Python formats `150.0` where JavaScript formats `150`, so the fingerprint normalizes numbers to match the Next.js output. The same input produces the identical hash in both backends, so existing cache entries keep hitting.
- **Response contract.** Cache hits and misses both return `{success, source, data}`, with errors as `{success: false, error}`, so the mobile app needed no changes.

### Deploying with Docker (AWS Elastic Beanstalk)

The `Dockerfile` builds a slim image that runs as a non-root user and listens on port 8080. Zip `Dockerfile`, `requirements.txt` and `app/` (with the `Dockerfile` at the zip root) and upload it as an Elastic Beanstalk Docker source bundle. Secrets are never baked into the image; set them as environment properties:

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Gemini API key |
| `FIREBASE_CREDENTIALS_JSON` | Full contents of the Firebase service account JSON (AWS injects secrets as strings, not files) |

Locally, `GOOGLE_APPLICATION_CREDENTIALS` can point to the key file instead. On Google Cloud, neither is needed because the platform's default credentials are used.
