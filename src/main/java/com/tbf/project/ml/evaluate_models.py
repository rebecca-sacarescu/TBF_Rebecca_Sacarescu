import pandas as pd
import numpy as np

from ml_common import load_csv, load_model, prepare_xy, ranking_metrics, regression_metrics
from ml_config import BEST_MODEL_PATH, MODEL_COMPARISON_PATH, RANKING_EXAMPLES_PATH, TARGET_COLUMN, TEST_PATH


def main():
    payload = load_model(BEST_MODEL_PATH)
    pipeline = payload["pipeline"]
    feature_columns = payload["feature_columns"]

    test_df = load_csv(TEST_PATH)
    X_test, y_test = prepare_xy(test_df, feature_columns)

    predictions = np.clip(pipeline.predict(X_test), 0, 100)

    evaluated = test_df.copy()
    evaluated["predicted_relevance_score"] = predictions
    evaluated["prediction_error"] = evaluated[TARGET_COLUMN] - evaluated["predicted_relevance_score"]

    reg = regression_metrics(y_test, predictions)
    rank = ranking_metrics(evaluated, "predicted_relevance_score")

    print(f"Best model: {payload['model_name']}")
    print(f"MAE: {reg['mae']:.4f}")
    print(f"RMSE: {reg['rmse']:.4f}")
    print(f"R2: {reg['r2']:.4f}")
    for key, value in rank.items():
        print(f"{key}: {value:.4f}")

    examples = (
        evaluated
        .sort_values(["actor_user_id", "predicted_relevance_score"], ascending=[True, False])
        .groupby("actor_user_id")
        .head(10)
        .loc[:, [
            "actor_user_id",
            "target_user_id",
            "static_score",
            "predicted_relevance_score",
            TARGET_COLUMN,
            "label",
            "card_click",
            "full_profile_open",
            "dwell_time_ms",
            "saved_profile",
        ]]
    )

    RANKING_EXAMPLES_PATH.parent.mkdir(parents=True, exist_ok=True)
    examples.to_csv(RANKING_EXAMPLES_PATH, index=False)

    print(f"Ranking examples saved to: {RANKING_EXAMPLES_PATH}")

    if MODEL_COMPARISON_PATH.exists():
        print(f"Model comparison already available at: {MODEL_COMPARISON_PATH}")


if __name__ == "__main__":
    main()
