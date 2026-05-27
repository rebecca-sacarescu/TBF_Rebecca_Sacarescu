import os
import joblib
import pandas as pd
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from config import OUTPUT_DIR

TRAIN_FILE = os.path.join(OUTPUT_DIR, "travel_buddy_ml_train.csv")
TEST_FILE = os.path.join(OUTPUT_DIR, "travel_buddy_ml_test.csv")
MODEL_FILE = os.path.join(OUTPUT_DIR, "feed_ranker.pkl")

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

TARGET = "relevance_score"


def main():
    train_df = pd.read_csv(TRAIN_FILE)
    test_df = pd.read_csv(TEST_FILE)

    X_train = train_df[FEATURES]
    y_train = train_df[TARGET]

    X_test = test_df[FEATURES]
    y_test = test_df[TARGET]

    model = DecisionTreeRegressor(random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print("MAE:", round(mae, 4))
    print("R2:", round(r2, 4))

    joblib.dump(model, MODEL_FILE)
    print("Model saved to:", MODEL_FILE)


if __name__ == "__main__":
    main()