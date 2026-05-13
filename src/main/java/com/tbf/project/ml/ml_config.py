from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]

DATA_DIR = ROOT_DIR / "ml_simulation" / "output"
OUTPUT_DIR = ROOT_DIR / "ml" / "output"
MODELS_DIR = ROOT_DIR / "ml" / "saved_models"

TRAIN_PATH = DATA_DIR / "travel_buddy_ml_train.csv"
TEST_PATH = DATA_DIR / "travel_buddy_ml_test.csv"
FULL_DATASET_PATH = DATA_DIR / "travel_buddy_ml_dataset.csv"
DATASET_B_PATH = DATA_DIR / "llm_decisions.csv"

BEST_MODEL_PATH = MODELS_DIR / "best_model.pkl"
MODEL_COMPARISON_PATH = OUTPUT_DIR / "model_comparison.csv"
RANKING_EXAMPLES_PATH = OUTPUT_DIR / "ranking_examples.csv"
DATASET_B_VALIDATION_PATH = OUTPUT_DIR / "dataset_b_validation.csv"
FEATURE_IMPORTANCE_PATH = OUTPUT_DIR / "feature_importance.csv"

TARGET_COLUMN = "relevance_score"

ID_COLUMNS = [
    "actor_user_id",
    "ractor_user_id",
    "target_user_id",
]

LEAKAGE_COLUMNS = [
    "label",
    "relevance_score",
    "interest_probability",
    "matched_proxy",
    "created_at",
    "reasoning",
]

OPTIONAL_HIGH_LEAKAGE_COLUMNS = [
    # interaction_type is the final explicit decision, so keep it excluded
    # from the main model. You can include it only in a separate experiment.
    "interaction_type",
]

STATIC_FEATURES = [
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
]

BEHAVIORAL_FEATURES = [
    "card_click",
    "full_profile_open",
    "dwell_time_ms",
    "saved_profile",
]

CATEGORICAL_FEATURES = [
    # Persona can be useful for simulator analysis, but it is not always
    # available in a real product. We keep it enabled for the ML experiment.
    "persona",
]
