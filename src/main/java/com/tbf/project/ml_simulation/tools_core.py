import random
from db import get_profile, list_candidates
from scoring import compute_pair_features
from personas import choose_persona, persona_bias
from csv_store import (
    record_event,
    record_saved_profile,
    record_interaction,
    record_decision
)


def clamp(value, min_value=0.0, max_value=1.0):
    return max(min_value, min(max_value, value))


def decide_behavior(actor_profile, target_profile, persona):
    features = compute_pair_features(actor_profile, target_profile)

    base_interest = features["static_score"] / 100
    bias = persona_bias(persona, actor_profile, target_profile, features)
    noise = random.uniform(-0.15, 0.15)

    interest_probability = clamp(base_interest + bias + noise)

    card_click = random.random() < clamp(0.25 + interest_probability * 0.75)

    full_profile_open = False
    if card_click:
        full_profile_open = random.random() < clamp(0.15 + interest_probability * 0.85)

    if full_profile_open:
        dwell_base = 5000 + int(interest_probability * 55000)
        dwell_noise = random.randint(-7000, 9000)
        dwell_time_ms = max(1500, min(90000, dwell_base + dwell_noise))
    else:
        dwell_time_ms = 0

    saved_profile = False
    interaction_type = "NO"

    if interest_probability >= 0.82:
        interaction_type = "SUPER_LIKE" if random.random() < 0.35 else "YES"
        saved_profile = random.random() < 0.35

    elif interest_probability >= 0.62:
        interaction_type = "YES"
        saved_profile = random.random() < 0.45

    elif interest_probability >= 0.42:
        if random.random() < 0.55:
            interaction_type = "SAVE_ONLY"
            saved_profile = True
        else:
            interaction_type = "NO"

    else:
        interaction_type = "NO"
        saved_profile = False

    if persona == "PASSIVE_BROWSER" and interaction_type == "YES":
        if random.random() < 0.45:
            interaction_type = "SAVE_ONLY"
            saved_profile = True

    matched_proxy = 1 if interaction_type in ["YES", "SUPER_LIKE"] and interest_probability >= 0.70 else 0

    if matched_proxy:
        label = 3
    elif interaction_type in ["YES", "SUPER_LIKE"]:
        label = 2
    elif saved_profile or dwell_time_ms >= 18000:
        label = 1
    else:
        label = 0

    relevance_score = features["static_score"]
    relevance_score += 8 if full_profile_open else 0
    relevance_score += min(dwell_time_ms / 1000, 60) * 0.35
    relevance_score += 12 if saved_profile else 0
    relevance_score += 22 if interaction_type == "YES" else 0
    relevance_score += 32 if interaction_type == "SUPER_LIKE" else 0
    relevance_score += 30 if matched_proxy else 0
    relevance_score -= 18 if interaction_type == "NO" else 0
    relevance_score = round(max(0, min(100, relevance_score)), 2)

    return {
        **features,
        "interest_probability": round(interest_probability, 4),
        "card_click": int(card_click),
        "full_profile_open": int(full_profile_open),
        "dwell_time_ms": dwell_time_ms,
        "saved_profile": int(saved_profile),
        "interaction_type": interaction_type,
        "matched_proxy": matched_proxy,
        "label": label,
        "relevance_score": relevance_score
    }


def simulate_pair(actor_user_id, target_user_id):
    actor_profile = get_profile(actor_user_id)
    target_profile = get_profile(target_user_id)

    if actor_profile is None or target_profile is None:
        return None

    persona = choose_persona(actor_profile)
    decision = decide_behavior(actor_profile, target_profile, persona)

    if decision["card_click"]:
        record_event(
            actor_user_id,
            target_user_id,
            "CARD_CLICK",
            "FEED_CARD"
        )

    if decision["full_profile_open"]:
        record_event(
            actor_user_id,
            target_user_id,
            "FULL_PROFILE_OPEN",
            "FULL_PROFILE"
        )

        record_event(
            actor_user_id,
            target_user_id,
            "DWELL_RECORDED",
            "FULL_PROFILE",
            decision["dwell_time_ms"]
        )

    if decision["saved_profile"]:
        record_saved_profile(actor_user_id, target_user_id)

    if decision["interaction_type"] != "SAVE_ONLY":
        record_interaction(
            actor_user_id,
            target_user_id,
            decision["interaction_type"]
        )

    record_decision({
        "actor_user_id": actor_user_id,
        "target_user_id": target_user_id,
        "persona": persona,
        **decision
    })

    return {
        "actor_user_id": actor_user_id,
        "target_user_id": target_user_id,
        "persona": persona,
        **decision
    }


def simulate_user(actor_user_id, candidates_limit=20):
    candidates = list_candidates(actor_user_id, candidates_limit)
    results = []

    for target_user_id in candidates:
        result = simulate_pair(actor_user_id, target_user_id)

        if result is not None:
            results.append(result)

    return results