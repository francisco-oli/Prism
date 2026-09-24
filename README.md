# Prism

Prism is a nutrition app that tells you whether a food fits *your* goals, not just whether it is "healthy" in general. Scan a barcode or type in a food, and Prism returns a short assessment written for your profile: your goals, your activity level, your language, and how much detail you want.

## Motivation

I built Prism after seeing nutrition misinformation affect people close to me. Packaging claims, conflicting advice, and generic "healthy" or "unhealthy" labels rarely consider who is actually eating the food. Prism takes a different approach: it uses your profile to explain in what context a food works for you and when it does not.

It is built end to end (mobile app, server, and LLM pipeline) and is used by real people. My family uses it to check whether a food is healthy for them and to understand what they are eating.

## How it works

1. You create a profile with your goals, activity level, language, and preferred level of detail.
2. You scan a barcode or enter a food manually.
3. The app sends the food and your profile to the server.
4. The server asks Google Gemini for a personalized assessment: a short review, whether the food is recommended for you, and its macros.
5. The app shows the result and saves it to your history.

### Caching

Calling the model on every request is slow and costly, so the server caches results in Firestore. Each result is stored under a key built from the food data and the profile fields that change the output (goals, activity level, explanation depth, language). Goals are sorted before hashing, so the same goals in a different order produce the same key.

If the key already exists, the server returns the stored result. If not, it calls Gemini and stores the response. Two users with different profiles never share a result for the same food, but repeated identical requests skip the model call.

## Project structure

```
app/         Mobile app (React Native / Expo)
backend/     Server, original version (Next.js)
backend-py/  Server, Python port (FastAPI)
```

Both servers expose the same `POST /api/analyze` endpoint and use the same Firestore cache, so the app works with either one.

## Running locally

You need your own Gemini API key and a Firebase service account file. Neither is included in this repo.

### Server (FastAPI)

```bash
cd backend-py
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Add your Gemini key to `.env` and place `serviceAccountKey.json` in the `backend-py` folder. Then start the server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 3000 --env-file .env
```


### Server (Next.js)

```bash
cd backend
npm install
cp .env.example .env.local
npm run dev
```

Add your Gemini key to `.env.local` and place `serviceAccountKey.json` in the `backend` folder.

### Mobile app

```bash
cd app
npm install
npx expo start
```

Set `BACKEND_URL` in `app/src/api.ts` to the address of your server.

## Deploying the FastAPI server to AWS

`backend-py` includes a `Dockerfile`. To deploy on AWS Elastic Beanstalk:

1. Zip the `Dockerfile`, `requirements.txt`, and the `app` folder, with the `Dockerfile` at the top level of the zip.
2. Create an Elastic Beanstalk application and upload the zip.
3. Set these environment properties:
   - `GEMINI_API_KEY`: your Gemini key
   - `FIREBASE_CREDENTIALS_JSON`: the full contents of `serviceAccountKey.json`
4. Update `BACKEND_URL` in the app to the new server address.

Do not put keys in the zip or the Docker image.

## Built with

- App: React Native, Expo
- Server: FastAPI (Python), Next.js
- Database: Firebase Firestore
- LLM: Google Gemini
- Cloud Hosting: AWS Elastic Beanstalk
