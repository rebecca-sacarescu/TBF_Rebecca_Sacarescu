from mcp.server.fastmcp import FastMCP

from db import get_profile, list_candidates, list_actor_ids
from csv_store import (
    record_event,
    record_saved_profile,
    record_interaction,
    append_csv,
    now_iso
)
from config import OUTPUT_DIR

import os

mcp = FastMCP("Travel Buddy LLM Behavioral Dataset MCP Server")

LLM_DECISIONS_FILE = os.path.join(OUTPUT_DIR, "llm_decisions.csv")


@mcp.tool()
def get_travel_profile(user_id: int) -> dict:
    """
    Return a Travel Buddy user profile from PostgreSQL.
    """
    profile = get_profile(user_id)
    if profile is None:
        return {"error": "Profile not found"}
    return profile


@mcp.tool()
def list_feed_candidates(actor_user_id: int, limit: int = 20) -> list[int]:
    """
    Return candidate user IDs for a Travel Buddy actor.
    """
    return list_candidates(actor_user_id, limit)


@mcp.tool()
def list_actor_users(start_index: int = 0, limit: int = 50) -> list[int]:
    """
    Return actor user IDs for batch dataset generation.
    start_index is zero-based.
    """
    all_ids = list_actor_ids(limit=None)
    return all_ids[start_index:start_index + limit]


@mcp.tool()
def record_card_click(actor_user_id: int, target_user_id: int) -> dict:
    """
    Record a CARD_CLICK event.
    """
    record_event(actor_user_id, target_user_id, "CARD_CLICK", "FEED_CARD")
    return {"status": "recorded", "event_type": "CARD_CLICK"}


@mcp.tool()
def record_full_profile_open(actor_user_id: int, target_user_id: int) -> dict:
    """
    Record a FULL_PROFILE_OPEN event.
    """
    record_event(actor_user_id, target_user_id, "FULL_PROFILE_OPEN", "FULL_PROFILE")
    return {"status": "recorded", "event_type": "FULL_PROFILE_OPEN"}


@mcp.tool()
def record_dwell(actor_user_id: int, target_user_id: int, dwell_time_ms: int) -> dict:
    """
    Record full profile dwell time.
    """
    if dwell_time_ms < 0:
        return {"error": "dwell_time_ms must be non-negative"}

    record_event(
        actor_user_id,
        target_user_id,
        "DWELL_RECORDED",
        "FULL_PROFILE",
        dwell_time_ms
    )

    return {
        "status": "recorded",
        "event_type": "DWELL_RECORDED",
        "dwell_time_ms": dwell_time_ms
    }


@mcp.tool()
def save_profile(actor_user_id: int, target_user_id: int) -> dict:
    """
    Record that actor saved target profile.
    """
    record_saved_profile(actor_user_id, target_user_id)
    return {"status": "recorded", "action": "SAVE"}


@mcp.tool()
def record_explicit_interaction(
        actor_user_id: int,
        target_user_id: int,
        interaction_type: str
) -> dict:
    """
    Record explicit interaction: NO, YES, or SUPER_LIKE.
    """
    interaction_type = interaction_type.strip().upper()

    if interaction_type not in ["NO", "YES", "SUPER_LIKE"]:
        return {"error": "interaction_type must be NO, YES, or SUPER_LIKE"}

    record_interaction(actor_user_id, target_user_id, interaction_type)

    return {
        "status": "recorded",
        "interaction_type": interaction_type
    }


@mcp.tool()
def record_llm_decision(
        actor_user_id: int,
        target_user_id: int,
        persona: str,
        card_click: bool,
        full_profile_open: bool,
        dwell_time_ms: int,
        saved_profile: bool,
        interaction_type: str,
        label: int,
        relevance_score: float,
        reasoning: str
) -> dict:
    """
    Record the final LLM behavioral decision for ML dataset generation.
    interaction_type can be NO, YES, SUPER_LIKE, or SAVE_ONLY.
    label:
      0 = no interest / skip
      1 = latent interest
      2 = strong interest / like
      3 = match proxy / very high reciprocal interest
    """

    interaction_type = interaction_type.strip().upper()

    if interaction_type not in ["NO", "YES", "SUPER_LIKE", "SAVE_ONLY"]:
        return {"error": "Invalid interaction_type"}

    if label not in [0, 1, 2, 3]:
        return {"error": "label must be 0, 1, 2, or 3"}

    relevance_score = max(0, min(100, float(relevance_score)))

    append_csv(
        LLM_DECISIONS_FILE,
        {
            "actor_user_id": actor_user_id,
            "target_user_id": target_user_id,
            "persona": persona,
            "card_click": int(card_click),
            "full_profile_open": int(full_profile_open),
            "dwell_time_ms": dwell_time_ms,
            "saved_profile": int(saved_profile),
            "interaction_type": interaction_type,
            "label": label,
            "relevance_score": relevance_score,
            "reasoning": reasoning,
            "created_at": now_iso()
        },
        [
            "actor_user_id",
            "target_user_id",
            "persona",
            "card_click",
            "full_profile_open",
            "dwell_time_ms",
            "saved_profile",
            "interaction_type",
            "label",
            "relevance_score",
            "reasoning",
            "created_at"
        ]
    )

    return {"status": "recorded", "file": LLM_DECISIONS_FILE}


if __name__ == "__main__":
    mcp.run()