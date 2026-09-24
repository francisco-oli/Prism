import json

from google import genai
from google.genai import types

from app.config import GEMINI_API_KEY, MODEL_NAME
from app.prompts import SYSTEM_PROMPT

client = genai.Client(api_key=GEMINI_API_KEY)


def generate_analysis(user_prompt: str) -> dict:
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=f"{SYSTEM_PROMPT}\n\n{user_prompt}",
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    if not response.text:
        raise ValueError("Gemini returned an empty response.")
    return json.loads(response.text)
