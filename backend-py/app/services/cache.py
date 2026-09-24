import json
from typing import Optional

from google.cloud import firestore

from app.config import (
    CACHE_COLLECTION,
    FIREBASE_CREDENTIALS_FILE,
    FIREBASE_CREDENTIALS_JSON,
)

if FIREBASE_CREDENTIALS_JSON:
    db = firestore.Client.from_service_account_info(json.loads(FIREBASE_CREDENTIALS_JSON))
elif FIREBASE_CREDENTIALS_FILE:
    db = firestore.Client.from_service_account_json(FIREBASE_CREDENTIALS_FILE)
else:
    db = firestore.Client()


def get_cached(key: str) -> Optional[dict]:
    doc = db.collection(CACHE_COLLECTION).document(key).get()
    return doc.to_dict() if doc.exists else None


def set_cached(key: str, data: dict) -> None:
    db.collection(CACHE_COLLECTION).document(key).set(data)
