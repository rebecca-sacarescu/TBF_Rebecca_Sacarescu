import os
import warnings
import joblib
import redis
import psycopg2
import pandas as pd
from collections import defaultdict
from config import OUTPUT_DIR
from db import list_actor_ids, get_profile
from scoring import compute_pair_features

warnings.filterwarnings("ignore")

MODEL_FILE = os.path.join(OUTPUT_DIR, "feed_ranker.pkl")

FEED_TTL_SECONDS = 86400

REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 0

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "TBF"
DB_USER = "postgres"
DB_PASSWORD = "rebecca"

FEATURES = [
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
    "card_click",
    "full_profile_open",
    "dwell_time_ms",
    "saved_profile",
]


def get_redis_client():
    return redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)


def load_behavioral_features():
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT,
        dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )
    cur = conn.cursor()

    cur.execute("""
        SELECT actor_user_id, target_user_id, event_type, dwell_time_ms
        FROM profile_interaction_events
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    behavioral = defaultdict(lambda: {
        "card_click": 0,
        "full_profile_open": 0,
        "dwell_time_ms": 0,
        "saved_profile": 0,
    })

    for actor_id, target_id, event_type, dwell_time_ms in rows:
        key = (actor_id, target_id)
        if event_type == "CARD_CLICK":
            behavioral[key]["card_click"] = 1
        elif event_type == "FULL_PROFILE_OPEN":
            behavioral[key]["full_profile_open"] = 1
        elif event_type == "DWELL_RECORDED" and dwell_time_ms:
            behavioral[key]["dwell_time_ms"] = max(behavioral[key]["dwell_time_ms"], dwell_time_ms)
        elif event_type == "SAVE":
            behavioral[key]["saved_profile"] = 1
        elif event_type == "UNSAVE":
            behavioral[key]["saved_profile"] = 0

    return behavioral


def build_feature_vector(pair_features, behavioral):
    row = {
        "budget_diff": pair_features["budget_diff"],
        "planning_diff": pair_features["planning_diff"],
        "social_diff": pair_features["social_diff"],
        "same_budget": pair_features["same_budget"],
        "same_planning_style": pair_features["same_planning_style"],
        "same_social_battery": pair_features["same_social_battery"],
        "shared_languages_count": pair_features["shared_languages_count"],
        "shared_activities_count": pair_features["shared_activities_count"],
        "shared_destination_types_count": pair_features["shared_destination_types_count"],
        "shared_experience_types_count": pair_features["shared_experience_types_count"],
        "shared_looking_for_what_count": pair_features["shared_looking_for_what_count"],
        "language_score": pair_features["language_score"],
        "activity_score": pair_features["activity_score"],
        "destination_score": pair_features["destination_score"],
        "experience_score": pair_features["experience_score"],
        "intent_score": pair_features["intent_score"],
        "static_score": pair_features["static_score"],
        "card_click": behavioral["card_click"],
        "full_profile_open": behavioral["full_profile_open"],
        "dwell_time_ms": behavioral["dwell_time_ms"],
        "saved_profile": behavioral["saved_profile"],
    }
    return pd.DataFrame([row], columns=FEATURES)


def rank_feed_for_user(actor_id, model, redis_client, all_profiles, all_behavioral):
    actor_profile = all_profiles.get(actor_id)
    if actor_profile is None:
        return

    candidates = [
        profile for uid, profile in all_profiles.items()
        if uid != actor_id
    ]

    if not candidates:
        return

    scored = []

    for candidate in candidates:
        try:
            pair_features = compute_pair_features(actor_profile, candidate)
            behavioral = all_behavioral[(actor_id, candidate["user_id"])]
            feature_vector = build_feature_vector(pair_features, behavioral)
            ml_score = float(model.predict(feature_vector)[0])
            ml_score = max(0.0, min(100.0, ml_score))
            scored.append((candidate["user_id"], ml_score))
        except Exception:
            continue

    if not scored:
        return

    redis_key = f"feed:user:{actor_id}"
    redis_client.delete(redis_key)

    for target_user_id, score in scored:
        redis_client.zadd(redis_key, {str(target_user_id): score})

    redis_client.expire(redis_key, FEED_TTL_SECONDS)


def main():
    if not os.path.exists(MODEL_FILE):
        raise FileNotFoundError("Model not found. Run train_and_save_model.py first.")

    model = joblib.load(MODEL_FILE)
    redis_client = get_redis_client()

    print("Loading behavioral features from database...")
    all_behavioral = load_behavioral_features()
    print(f"Loaded behavioral data for {len(all_behavioral)} pairs.")

    actor_ids = list_actor_ids()
    print(f"Loading profiles for {len(actor_ids)} users...")

    all_profiles = {}
    for user_id in actor_ids:
        profile = get_profile(user_id)
        if profile is not None:
            all_profiles[user_id] = profile

    print(f"Loaded {len(all_profiles)} profiles.")

    total = len(all_profiles)

    for index, actor_id in enumerate(all_profiles.keys(), start=1):
        print(f"[{index}/{total}] Ranking feed for user {actor_id}")
        rank_feed_for_user(actor_id, model, redis_client, all_profiles, all_behavioral)

    print("Feed ranking complete. All feeds written to Redis.")


if __name__ == "__main__":
    main()