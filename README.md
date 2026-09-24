# Prism

Prism is a nutrition app. You scan a food or type it in, and it tells you if that food is a good choice **for you**, based on your own goals.

## Why I made it

I saw people close to me get confused by nutrition advice. Labels and articles often say "healthy" or "unhealthy" without thinking about who is eating the food. Prism tries to do better. It looks at your profile and explains how a food fits into your life.

I built the whole thing myself: the phone app, the server, and the AI part. My family uses it to check if a food is healthy and to understand what they are eating.

## What it does

1. You set up a profile: your goals, how active you are, your language, and how much detail you want.
2. You scan a barcode or type a food.
3. The app sends the food and your profile to the server.
4. The server asks an AI model (Google Gemini) to write a short review for you.
5. You see the calories, protein, carbs, fat, and the review.

### Saving answers to avoid repeat work

Asking the AI every time is slow and costs money. So the server saves each answer in a database (Firestore).

Each saved answer has a label made from the food and the parts of your profile that change the answer. If the same request comes again, the server returns the saved answer. If it is new, the server asks the AI and saves the result.

The label ignores the order of your goals. "Muscle, Fat loss" and "Fat loss, Muscle" count as the same request.

## Folders

```
app/         The phone app (React Native / Expo)
backend/     The server, first version (Next.js)
backend-py/  The server, second version (Python / FastAPI)
```

The two servers do the same job. You only need one. The app works with either one.

## How to run it

You need your own Gemini API key and a Firebase service account file. They are not in this repo.

### Server (Python version)

```bash
cd backend-py
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Open `.env` and add your Gemini key. Put your `serviceAccountKey.json` file in the `backend-py` folder. Then start the server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 3000 --env-file .env
```

Do not write your keys in `.env.example`. That file is public. Only use `.env`.

### Server (Next.js version)

```bash
cd backend
npm install
cp .env.example .env.local
npm run dev
```

Add your Gemini key to `.env.local` and put `serviceAccountKey.json` in the `backend` folder.

### Phone app

```bash
cd app
npm install
npx expo start
```

Open `app/src/api.ts` and set `BACKEND_URL` to the address of your server.

## Putting the Python server online (AWS)

The Python server comes with a `Dockerfile`. To deploy it on AWS Elastic Beanstalk:

1. Make a zip file with `Dockerfile`, `requirements.txt` and the `app` folder. The `Dockerfile` must be at the top of the zip.
2. Create a Beanstalk app with the Docker platform and upload the zip.
3. In the settings, add these two variables:
   - `GEMINI_API_KEY`: your Gemini key
   - `FIREBASE_CREDENTIALS_JSON`: the full text inside your `serviceAccountKey.json`
4. Change `BACKEND_URL` in the app to your new server address.

Never put keys inside the zip or the Docker image.

## Built with

- Phone app: React Native, Expo
- Server: FastAPI (Python) or Next.js
- Database: Firebase Firestore
- AI: Google Gemini
