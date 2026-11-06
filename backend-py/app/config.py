import os
from pathlib import Path
from dotenv import load_dotenv

# config.py is in backend-py/app/, so this points to backend-py/.env
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

MODEL_NAME = "gemini-3.6-flash"

CACHE_COLLECTION = "food_cache"

# Service account JSON, either as the raw content (for AWS, injected from an
# env var/secret) or as a file path (for local dev). When neither is set, the
# Firestore client falls back to the platform's default credentials.
FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS_JSON")
FIREBASE_CREDENTIALS_FILE = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
