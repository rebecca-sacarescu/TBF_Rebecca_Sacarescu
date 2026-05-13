import math
from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ml_config import (
    BEHAVIORAL_FEATURES,
    CATEGORICAL_FEATURES,
    FEATURE_IMPORTANCE_PATH,
    ID_COLUMNS,
    LEAKAGE_COLUMNS,
    OPTIONAL_HIGH_LEAKAGE_COLUMNS,
    STATIC_FEATURES,
    TARGET_COLUMN,
)


def ensure_dirs(*paths: Path) -> None:
    for path in paths:
        path.mkdir(parents=True, exist_ok=True)


def normalize_actor_column(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "ractor_user_id" in df.columns and "actor_user_id" not in df.columns:
        df = df.rename(columns={"ractor_user_id": "actor_user_id"})
    return df


def load_csv(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    return normalize_actor_column(pd.read_csv(path))


def get_feature_columns(
    df: pd.DataFrame,
    include_behavioral: bool = True,
    include_persona: bool = True,
    include_interaction_type: bool = False,
) -> List[str]:
    desired = list(STATIC_FEATURES)

    if include_behavioral:
        desired += BEHAVIORAL_FEATURES

    if include_persona:
        desired += CATEGORICAL_FEATURES

    if include_interaction_type:
        desired += ["interaction_type"]

    blocked = set(ID_COLUMNS + LEAKAGE_COLUMNS)
    if not include_interaction_type:
        blocked.update(OPTIONAL_HIGH_LEAKAGE_COLUMNS)

    features = [
        col for col in desired
        if col in df.columns and col not in blocked
    ]

    if TARGET_COLUMN in features:
        features.remove(TARGET_COLUMN)

    return features


def split_feature_types(df: pd.DataFrame, feature_columns: List[str]) -> Tuple[List[str], List[str]]:
    categorical = []
    numeric = []

    for col in feature_columns:
        if df[col].dtype == "object" or col in CATEGORICAL_FEATURES or col == "interaction_type":
            categorical.append(col)
        else:
            numeric.append(col)

    return numeric, categorical


def make_preprocessor(df: pd.DataFrame, feature_columns: List[str], scale_numeric: bool) -> ColumnTransformer:
    numeric, categorical = split_feature_types(df, feature_columns)

    numeric_transformer = StandardScaler() if scale_numeric else "passthrough"

    try:
        categorical_transformer = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        categorical_transformer = OneHotEncoder(handle_unknown="ignore", sparse=False)

    return ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric),
            ("cat", categorical_transformer, categorical),
        ],
        remainder="drop",
    )


def make_pipeline(model, df: pd.DataFrame, feature_columns: List[str], scale_numeric: bool) -> Pipeline:
    return Pipeline(
        steps=[
            ("preprocess", make_preprocessor(df, feature_columns, scale_numeric)),
            ("model", model),
        ]
    )


def prepare_xy(df: pd.DataFrame, feature_columns: List[str]):
    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Missing target column: {TARGET_COLUMN}")

    X = df[feature_columns].copy()
    y = df[TARGET_COLUMN].astype(float).copy()

    for col in feature_columns:
        if X[col].dtype != "object":
            X[col] = pd.to_numeric(X[col], errors="coerce").fillna(0)
        else:
            X[col] = X[col].fillna("UNKNOWN")

    return X, y


def regression_metrics(y_true, y_pred) -> Dict[str, float]:
    y_pred = np.asarray(y_pred, dtype=float)
    y_true = np.asarray(y_true, dtype=float)

    return {
        "mae": mean_absolute_error(y_true, y_pred),
        "rmse": math.sqrt(mean_squared_error(y_true, y_pred)),
        "r2": r2_score(y_true, y_pred),
    }


def precision_at_k(group: pd.DataFrame, score_col: str, label_col: str, k: int, relevant_threshold: int = 2) -> float:
    if group.empty:
        return np.nan

    top_k = group.sort_values(score_col, ascending=False).head(k)
    if top_k.empty:
        return np.nan

    return float((top_k[label_col] >= relevant_threshold).mean())


def dcg_at_k(relevance_values: List[float], k: int) -> float:
    relevance_values = relevance_values[:k]
    total = 0.0

    for index, relevance in enumerate(relevance_values):
        gain = (2 ** relevance - 1)
        discount = math.log2(index + 2)
        total += gain / discount

    return total


def ndcg_at_k(group: pd.DataFrame, score_col: str, relevance_col: str, k: int) -> float:
    if group.empty:
        return np.nan

    predicted = group.sort_values(score_col, ascending=False)[relevance_col].astype(float).tolist()
    ideal = group.sort_values(relevance_col, ascending=False)[relevance_col].astype(float).tolist()

    ideal_dcg = dcg_at_k(ideal, k)
    if ideal_dcg == 0:
        return np.nan

    return dcg_at_k(predicted, k) / ideal_dcg


def ranking_metrics(
    df: pd.DataFrame,
    score_col: str,
    relevance_col: str = "label",
    actor_col: str = "actor_user_id",
    ks=(5, 10),
) -> Dict[str, float]:
    if actor_col not in df.columns:
        return {f"ndcg@{k}": np.nan for k in ks} | {f"precision@{k}": np.nan for k in ks}

    rows = []
    for _, group in df.groupby(actor_col):
        if len(group) < 2:
            continue

        item = {}
        for k in ks:
            item[f"ndcg@{k}"] = ndcg_at_k(group, score_col, relevance_col, k)
            item[f"precision@{k}"] = precision_at_k(group, score_col, relevance_col, k)
        rows.append(item)

    if not rows:
        return {f"ndcg@{k}": np.nan for k in ks} | {f"precision@{k}": np.nan for k in ks}

    metrics_df = pd.DataFrame(rows)
    return {col: float(metrics_df[col].mean()) for col in metrics_df.columns}


def save_model(payload: dict, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(payload, path)


def load_model(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")
    return joblib.load(path)


def write_feature_importance(model_payload: dict, output_path: Path = FEATURE_IMPORTANCE_PATH) -> None:
    pipeline = model_payload["pipeline"]
    feature_columns = model_payload["feature_columns"]

    model = pipeline.named_steps["model"]
    preprocessor = pipeline.named_steps["preprocess"]

    if not hasattr(model, "feature_importances_"):
        return

    try:
        names = preprocessor.get_feature_names_out(feature_columns)
    except Exception:
        names = feature_columns

    importances = model.feature_importances_
    size = min(len(names), len(importances))

    importance_df = pd.DataFrame({
        "feature": list(names)[:size],
        "importance": importances[:size],
    }).sort_values("importance", ascending=False)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    importance_df.to_csv(output_path, index=False)
