import warnings

import numpy as np
import pandas as pd
from sklearn.ensemble import AdaBoostRegressor, GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor

from ml_common import (
    ensure_dirs,
    get_feature_columns,
    load_csv,
    make_pipeline,
    prepare_xy,
    ranking_metrics,
    regression_metrics,
    save_model,
    write_feature_importance,
)
from ml_config import (
    BEST_MODEL_PATH,
    MODEL_COMPARISON_PATH,
    MODELS_DIR,
    OUTPUT_DIR,
    TARGET_COLUMN,
    TEST_PATH,
    TRAIN_PATH,
)

warnings.filterwarnings("ignore")


def build_models():
    return {
        "linear_regression": {
            "model": LinearRegression(),
            "scale": True,
        },
        "ridge_regression": {
            "model": Ridge(alpha=1.0, random_state=42),
            "scale": True,
        },
        "knn_regressor": {
            "model": KNeighborsRegressor(n_neighbors=15, weights="distance"),
            "scale": True,
        },
        "decision_tree": {
            "model": DecisionTreeRegressor(
                max_depth=8,
                min_samples_leaf=20,
                random_state=42,
            ),
            "scale": False,
        },
        "random_forest": {
            "model": RandomForestRegressor(
                n_estimators=300,
                max_depth=12,
                min_samples_leaf=5,
                random_state=42,
                n_jobs=-1,
            ),
            "scale": False,
        },
        "adaboost": {
            "model": AdaBoostRegressor(
                estimator=DecisionTreeRegressor(max_depth=5, min_samples_leaf=15, random_state=42),
                n_estimators=150,
                learning_rate=0.05,
                random_state=42,
            ),
            "scale": False,
        },
        "gradient_boosting": {
            "model": GradientBoostingRegressor(
                n_estimators=250,
                learning_rate=0.05,
                max_depth=4,
                random_state=42,
            ),
            "scale": False,
        },
    }


def evaluate_static_baseline(test_df: pd.DataFrame):
    if "static_score" not in test_df.columns:
        return None

    metrics = regression_metrics(test_df[TARGET_COLUMN], test_df["static_score"])
    ranked = test_df.copy()
    ranked["prediction"] = ranked["static_score"]
    rank_metrics = ranking_metrics(ranked, "prediction")

    return {
        "model": "static_matching_v2_baseline",
        "mae": metrics["mae"],
        "rmse": metrics["rmse"],
        "r2": metrics["r2"],
        **rank_metrics,
        "is_baseline": True,
    }


def main():
    ensure_dirs(OUTPUT_DIR, MODELS_DIR)

    train_df = load_csv(TRAIN_PATH)
    test_df = load_csv(TEST_PATH)

    feature_columns = get_feature_columns(
        train_df,
        include_behavioral=True,
        include_persona=True,
        include_interaction_type=False,
    )

    X_train, y_train = prepare_xy(train_df, feature_columns)
    X_test, y_test = prepare_xy(test_df, feature_columns)

    results = []

    baseline = evaluate_static_baseline(test_df)
    if baseline:
        results.append(baseline)

    best_payload = None
    best_score = -np.inf

    for model_name, config in build_models().items():
        print(f"Training {model_name}...")

        pipeline = make_pipeline(
            config["model"],
            train_df,
            feature_columns,
            scale_numeric=config["scale"],
        )

        pipeline.fit(X_train, y_train)
        predictions = pipeline.predict(X_test)
        predictions = np.clip(predictions, 0, 100)

        reg = regression_metrics(y_test, predictions)

        ranked_test = test_df.copy()
        ranked_test["prediction"] = predictions
        rank = ranking_metrics(ranked_test, "prediction")

        row = {
            "model": model_name,
            "mae": reg["mae"],
            "rmse": reg["rmse"],
            "r2": reg["r2"],
            **rank,
            "is_baseline": False,
        }
        results.append(row)

        ndcg10 = row.get("ndcg@10", float("nan"))
        if not np.isnan(ndcg10) and ndcg10 > best_score:
            best_score = ndcg10
            best_payload = {
                "model_name": model_name,
                "pipeline": pipeline,
                "feature_columns": feature_columns,
                "target_column": TARGET_COLUMN,
                "ranking_metric": "ndcg@10",
                "ranking_metric_value": ndcg10,
            }

    comparison = pd.DataFrame(results).sort_values(
        by=["ndcg@10", "rmse"],
        ascending=[False, True],
    )
    comparison.to_csv(MODEL_COMPARISON_PATH, index=False)

    if best_payload is None:
        raise RuntimeError("No model was trained successfully.")

    save_model(best_payload, BEST_MODEL_PATH)
    write_feature_importance(best_payload)

    print("\nModel comparison:")
    print(comparison.to_string(index=False))
    print(f"\nBest model saved to: {BEST_MODEL_PATH}")
    print(f"Best model: {best_payload['model_name']} ({best_payload['ranking_metric']}={best_payload['ranking_metric_value']:.4f})")
    print(f"Comparison saved to: {MODEL_COMPARISON_PATH}")


if __name__ == "__main__":
    main()
