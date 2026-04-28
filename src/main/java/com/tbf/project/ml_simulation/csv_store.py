import csv
import os
from datetime import datetime
from config import OUTPUT_DIR

os.makedirs(OUTPUT_DIR, exist_ok=True)

EVENTS_FILE = os.path.join(OUTPUT_DIR, "simulated_events.csv")
INTERACTIONS_FILE = os.path.join(OUTPUT_DIR, "simulated_interactions.csv")
SAVED_FILE = os.path.join(OUTPUT_DIR, "simulated_saved_profiles.csv")
DECISIONS_FILE = os.path.join(OUTPUT_DIR, "simulated_decisions.csv")


def append_csv(path, row, headers):
    file_exists = os.path.exists(path)

    with open(path, "a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=headers)

        if not file_exists:
            writer.writeheader()

        writer.writerow(row)


def now_iso():
    return datetime.now().isoformat()


def record_event(actor_user_id, target_user_id, event_type, surface, dwell_time_ms=None):
    append_csv(
        EVENTS_FILE,
        {
            "actor_user_id": actor_user_id,
            "target_user_id": target_user_id,
            "event_type": event_type,
            "surface": surface,
            "dwell_time_ms": dwell_time_ms if dwell_time_ms is not None else "",
            "created_at": now_iso()
        },
        [
            "actor_user_id",
            "target_user_id",
            "event_type",
            "surface",
            "dwell_time_ms",
            "created_at"
        ]
    )


def record_saved_profile(actor_user_id, target_user_id):
    append_csv(
        SAVED_FILE,
        {
            "actor_user_id": actor_user_id,
            "target_user_id": target_user_id,
            "created_at": now_iso()
        },
        [
            "actor_user_id",
            "target_user_id",
            "created_at"
        ]
    )


def record_interaction(actor_user_id, target_user_id, interaction_type):
    append_csv(
        INTERACTIONS_FILE,
        {
            "actor_user_id": actor_user_id,
            "target_user_id": target_user_id,
            "interaction_type": interaction_type,
            "created_at": now_iso()
        },
        [
            "actor_user_id",
            "target_user_id",
            "interaction_type",
            "created_at"
        ]
    )


def record_decision(row):
    append_csv(
        DECISIONS_FILE,
        row,
        [
            "actor_user_id",
            "target_user_id",
            "persona",
            "budget_diff",
            "planning_diff",
            "social_diff",
            "same_budget",
            "same_planning_style",
            "same_social_battery",
            "shared_languages_count",
            "shared_activities_count",
            "shared_destination_types_count",
            "shared_experience_types_count",
            "shared_looking_for_what_count",
            "language_score",
            "activity_score",
            "destination_score",
            "experience_score",
            "intent_score",
            "static_score",
            "interest_probability",
            "card_click",
            "full_profile_open",
            "dwell_time_ms",
            "saved_profile",
            "interaction_type",
            "matched_proxy",
            "label",
            "relevance_score"
        ]
    )