import argparse
import numpy as np
import pandas as pd

from ml_common import load_csv, load_model, prepare_xy
from ml_config import BEST_MODEL_PATH, FULL_DATASET_PATH


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--actor-id", type=int, required=True)
    parser.add_argument("--top-k", type=int, default=10)
    args = parser.parse_args()

    payload = load_model(BEST_MODEL_PATH)
    pipeline = payload["pipeline"]
    feature_columns = payload["feature_columns"]

    df = load_csv(FULL_DATASET_PATH)
    actor_df = df[df["actor_user_id"] == args.actor_id].copy()

    if actor_df.empty:
        raise ValueError(f"No rows found for actor_user_id={args.actor_id}")

    X, _ = prepare_xy(actor_df, feature_columns)
    actor_df["predicted_relevance_score"] = np.clip(pipeline.predict(X), 0, 100)

    output_columns = [
        "actor_user_id",
        "target_user_id",
        "static_score",
        "predicted_relevance_score",
        "label",
        "relevance_score",
        "card_click",
        "full_profile_open",
        "dwell_time_ms",
        "saved_profile",
    ]
    output_columns = [col for col in output_columns if col in actor_df.columns]

    ranked = actor_df.sort_values("predicted_relevance_score", ascending=False).head(args.top_k)

    print(ranked[output_columns].to_string(index=False))


if __name__ == "__main__":
    main()
