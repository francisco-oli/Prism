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


async def run_alternatives_agent(req: AlternativesRequest) -> AlternativesResponse:
    return AlternativesResponse(alternatives=[])


if __name__ == "__main__":
    state = graph.invoke({"messages": [{"role": "user", "content": ALTERNATIVES_PROMPT}]})
    for m in state["messages"]:
        print(type(m).__name__, ":", m.text)