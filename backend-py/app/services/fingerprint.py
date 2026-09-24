import hashlib

from app.schemas import ScannedData


def _num(value: float) -> str:
    # Match JavaScript's number-to-string (150 -> "150", not "150.0") so keys
    # stay identical to the ones the Next.js backend wrote.
    return str(int(value)) if value == int(value) else repr(value)


def generate_hash(data: ScannedData) -> str:
    ingredients = ",".join(sorted(i.strip().lower() for i in data.ingredients))

    profile = data.userProfile
    language = ((profile and profile.language) or "English").lower()
    # Sorted so ["Fat Loss", "Muscle"] and ["Muscle", "Fat Loss"] share a key
    goals = ",".join(sorted((profile and profile.goals) or [])).lower()
    activity = ((profile and profile.activityLevel) or "Active").lower()
    depth = ((profile and profile.explanationDepth) or "Give me some context").lower()

    raw = (
        f"{_num(data.calories)}-{_num(data.protein_g)}-{_num(data.carbs_g)}-{_num(data.fat_g)}"
        f"-{ingredients}-{language}-{goals}-{activity}-{depth}"
    )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
