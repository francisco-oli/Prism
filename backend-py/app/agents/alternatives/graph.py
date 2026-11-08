from collections import Counter

import httpx
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict
from typing import Annotated

from app.agents.alternatives.schemas import AlternativesResponse, AlternativesRequest
from app.agents.alternatives.prompts import ALTERNATIVES_PROMPT
from app.config import GEMINI_API_KEY, MODEL_NAME



print("KEY LOADED:", GEMINI_API_KEY is not None and GEMINI_API_KEY != "")


llm = init_chat_model(
    MODEL_NAME,
    model_provider="google_genai",
    google_api_key=GEMINI_API_KEY,
)


class State(TypedDict):
    messages: Annotated[list, add_messages]


def chatbot(state: State):
    return {"messages": [llm.invoke(state["messages"])]}


graph_builder = StateGraph(State)
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_edge(START, "chatbot")
graph_builder.add_edge("chatbot", END)
graph = graph_builder.compile()


OFF_SEARCH_URL = "https://search.openfoodfacts.org/search"
OFF_TAXONOMY_URL = "https://world.openfoodfacts.org/api/v2/taxonomy"
# Open Food Facts asks API users to identify their app
OFF_HEADERS = {"User-Agent": "Prism/0.1"}


async def search_category_candidates(food_name: str, page_size: int = 50):
    """Search Open Food Facts for products matching food_name and count their categories.

    Returns (categories, subcategories), each a list of (tag, product_count) pairs, most
    common first. Same rule as the app's barcode scan: a product's subcategory is its most
    specific known category, and its category is that subcategory's parent.
    """
    async with httpx.AsyncClient(headers=OFF_HEADERS, timeout=10) as client:
        search = await client.get(OFF_SEARCH_URL, params={
            "q": food_name,
            "page_size": page_size,
            "fields": "categories_tags",
            "langs": "en",
        })
        search.raise_for_status()
        hits = [hit.get("categories_tags") or [] for hit in search.json().get("hits", [])]

        # The taxonomy API returns {} for tags that aren't real categories, and parents for the rest
        tags = sorted({tag for hit in hits for tag in hit})
        taxonomy = {}
        for i in range(0, len(tags), 50):
            response = await client.get(OFF_TAXONOMY_URL, params={
                "tagtype": "categories",
                "fields": "name,parents",
                "tags": ",".join(tags[i:i + 50]),
            })
            response.raise_for_status()
            taxonomy.update(response.json())

    categories, subcategories = Counter(), Counter()
    for hit in hits:
        known = [tag for tag in hit if taxonomy.get(tag)]
        if not known:
            continue

        subcategory = known[-1]
        parents = taxonomy[subcategory].get("parents", [])
        broader = known[:-1]
        category = next((tag for tag in reversed(broader) if tag in parents), broader[-1] if broader else None)

        subcategories[subcategory] += 1
        if category:
            categories[category] += 1

    return categories.most_common(), subcategories.most_common()


async def run_alternatives_agent(req: AlternativesRequest) -> AlternativesResponse:

    category = req.data.category
    subcategory = req.data.subcategory

    if (not category or not subcategory) and req.data.name:
        categories, subcategories = await search_category_candidates(req.data.name)
        print("Candidate categories:", categories)
        print("Candidate subcategories:", subcategories)

    return AlternativesResponse(alternatives=[])


if __name__ == "__main__":
    state = graph.invoke({"messages": [{"role": "user", "content": ALTERNATIVES_PROMPT}]})
    for m in state["messages"]:
        print(type(m).__name__, ":", m.text)