import numpy as np
import pandas as pd

from ml_common import load_csv, load_model
from ml_config import BEST_MODEL_PATH, DATASET_B_PATH, DATASET_B_VALIDATION_PATH, FULL_DATASET_PATH, TARGET_COLUMN


def main():
    payload = load_model(BEST_MODEL_PATH)
    pipeline = payload["pipeline"]
    feature_columns = payload["feature_columns"]

    dataset_a = load_csv(FULL_DATASET_PATH)
    dataset_b = load_csv(DATASET_B_PATH)

    # Dataset B has behavioral + label/relevance + reasoning, but it does not
    # contain static pair features. We join static features from Dataset A when
    # the same actor-target pair exists.
    join_cols = ["actor_user_id", "target_user_id"]

    static_cols = [
        col for col in dataset_a.columns
        if col not in ["label", "relevance_score", "card_click", "full_profile_open", "dwell_time_ms",
                       "saved_profile", "interaction_type", "matched_proxy", "interest_probability"]
    ]

    merged = dataset_b.merge(
        dataset_a[static_cols].drop_duplicates(subset=join_cols),
        on=join_cols,
        how="left",
        suffixes=("", "_a"),
    )

    missing_feature_cols = [col for col in feature_columns if col not in merged.columns]
    if missing_feature_cols:
        raise ValueError(
            "Dataset B cannot be validated because these model feature columns are missing after join: "
            + ", ".join(missing_feature_cols)
        )

    X = merged[feature_columns].copy()
    for col in feature_columns:
        if X[col].dtype != "object":
            X[col] = pd.to_numeric(X[col], errors="coerce").fillna(0)
        else:
            X[col] = X[col].fillna("UNKNOWN")

    merged["predicted_relevance_score"] = np.clip(pipeline.predict(X), 0, 100)
    merged["prediction_error"] = merged[TARGET_COLUMN] - merged["predicted_relevance_score"]

    pearson = merged[[TARGET_COLUMN, "predicted_relevance_score"]].corr(method="pearson").iloc[0, 1]
    spearman = merged[[TARGET_COLUMN, "predicted_relevance_score"]].corr(method="spearman").iloc[0, 1]

    output_cols = [
        "actor_user_id",
        "target_user_id",
        "persona",
        "interaction_type",
        "label",
        TARGET_COLUMN,
        "predicted_relevance_score",
        "prediction_error",
        "reasoning",
    ]
    output_cols = [col for col in output_cols if col in merged.columns]

    DATASET_B_VALIDATION_PATH.parent.mkdir(parents=True, exist_ok=True)
    merged[output_cols].sort_values("predicted_relevance_score", ascending=False).to_csv(
        DATASET_B_VALIDATION_PATH,
        index=False,
    )

    print(f"Dataset B validation saved to: {DATASET_B_VALIDATION_PATH}")
    print(f"Pearson correlation: {pearson:.4f}")
    print(f"Spearman correlation: {spearman:.4f}")
    print("\nTop predicted Dataset B examples:")
    print(merged[output_cols].sort_values("predicted_relevance_score", ascending=False).head(10).to_string(index=False))


if __name__ == "__main__":
    main()
