from mcp.server.fastmcp import FastMCP
from db import get_profile, list_candidates
from tools_core import simulate_pair, simulate_user

mcp = FastMCP("Travel Buddy ML Simulation MCP Server")


@mcp.tool()
def get_travel_profile(user_id: int) -> dict:
    """
    Return one Travel Buddy profile with its Travel DNA attributes.
    """
    profile = get_profile(user_id)

    if profile is None:
        return {"error": "Profile not found"}

    return profile


@mcp.tool()
def list_feed_candidates(actor_user_id: int, limit: int = 20) -> list[int]:
    """
    Return random candidate user IDs for a simulated feed.
    """
    return list_candidates(actor_user_id, limit)


@mcp.tool()
def simulate_actor_target_interaction(actor_user_id: int, target_user_id: int) -> dict:
    """
    Simulate one actor-target behavioral interaction and write CSV logs.
    """
    result = simulate_pair(actor_user_id, target_user_id)

    if result is None:
        return {"error": "Could not simulate pair"}

    return result


@mcp.tool()
def simulate_actor_feed(actor_user_id: int, limit: int = 20) -> list[dict]:
    """
    Simulate one actor browsing a feed of candidates.
    """
    return simulate_user(actor_user_id, limit)


if __name__ == "__main__":
    mcp.run()