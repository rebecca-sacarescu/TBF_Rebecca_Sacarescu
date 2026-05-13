import argparse
import random
from dataclasses import dataclass
from typing import List

import numpy as np
import pandas as pd

from ml_common import load_csv, load_model, prepare_xy
from ml_config import BEST_MODEL_PATH, FULL_DATASET_PATH


@dataclass
class BanditConfig:
    alpha: float = 0.25
    epsilon: float = 0.10
    ml_weight: float = 0.75
    q_weight: float = 0.25
    default_q: float = 0.50


def normalize_dwell(dwell_time_ms: float, max_ms: float = 30000.0) -> float:
    return max(0.0, min(float(dwell_time_ms) / max_ms, 1.0))


def compute_complex_reward(row: pd.Series) -> float:
    click = float(row.get("card_click", 0))
    open_profile = float(row.get("full_profile_open", 0))
    dwell = normalize_dwell(row.get("dwell_time_ms", 0))
    save = float(row.get("saved_profile", 0))

    interaction = str(row.get("interaction_type", "")).upper()
    yes = 1.0 if interaction == "YES" else 0.0
    super_like = 1.0 if interaction == "SUPER_LIKE" else 0.0
    match = float(row.get("matched_proxy", 0))

    reward = (
        0.10 * click +
        0.20 * open_profile +
        0.30 * dwell +
        0.35 * save +
        0.50 * yes +
        0.70 * super_like +
        0.30 * match
    )

    return max(0.0, min(reward, 1.0))


def update_q_value(q_old: float, reward: float, alpha: float) -> float:
    return q_old + alpha * (reward - q_old)


def apply_epsilon_greedy(ranked_df: pd.DataFrame, epsilon: float, top_insert_position: int = 2) -> pd.DataFrame:
    if len(ranked_df) < 6 or random.random() > epsilon:
        return ranked_df

    result = ranked_df.copy().reset_index(drop=True)
    lower_start = min(5, len(result) - 1)

    random_index = random.randint(lower_start, len(result) - 1)
    selected = result.iloc[[random_index]]
    remaining = result.drop(index=random_index).reset_index(drop=True)

    top_insert_position = min(top_insert_position, len(remaining))
    reranked = pd.concat(
        [
            remaining.iloc[:top_insert_position],
            selected,
            remaining.iloc[top_insert_position:],
        ],
        ignore_index=True,
    )

    return reranked


def build_bandit_scores(df: pd.DataFrame, config: BanditConfig) -> pd.DataFrame:
    # This simulates online bandit learning over the existing dataset.
    # In backend, q_value would be stored in PostgreSQL per actor-target pair.
    q_values = {}

    rows = []
    for _, row in df.iterrows():
        key = (int(row["actor_user_id"]), int(row["target_user_id"]))
        q_old = q_values.get(key, config.default_q)
        reward = compute_complex_reward(row)
        q_new = update_q_value(q_old, reward, config.alpha)
        q_values[key] = q_new

        output = row.to_dict()
        output["bandit_reward"] = reward
        output["q_value_old"] = q_old
        output["q_value_new"] = q_new
        rows.append(output)

    return pd.DataFrame(rows)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--actor-id", type=int, required=True)
    parser.add_argument("--top-k", type=int, default=10)
    args = parser.parse_args()

    config = BanditConfig()

    payload = load_model(BEST_MODEL_PATH)
    pipeline = payload["pipeline"]
    feature_columns = payload["feature_columns"]

    df = load_csv(FULL_DATASET_PATH)
    df = build_bandit_scores(df, config)

    actor_df = df[df["actor_user_id"] == args.actor_id].copy()
    if actor_df.empty:
        raise ValueError(f"No rows found for actor_user_id={args.actor_id}")

    X, _ = prepare_xy(actor_df, feature_columns)
    actor_df["ml_score"] = np.clip(pipeline.predict(X), 0, 100) / 100.0
    actor_df["final_bandit_score"] = (
        config.ml_weight * actor_df["ml_score"] +
        config.q_weight * actor_df["q_value_new"]
    )

    ranked = actor_df.sort_values("final_bandit_score", ascending=False)
    ranked = apply_epsilon_greedy(ranked, config.epsilon)
    ranked = ranked.head(args.top_k)

    columns = [
        "actor_user_id",
        "target_user_id",
        "static_score",
        "ml_score",
        "bandit_reward",
        "q_value_new",
        "final_bandit_score",
        "interaction_type",
        "label",
        "relevance_score",
    ]
    columns = [col for col in columns if col in ranked.columns]

    print(ranked[columns].to_string(index=False))


if __name__ == "__main__":
    main()
