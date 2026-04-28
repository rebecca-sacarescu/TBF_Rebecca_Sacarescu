import os
import pandas as pd
from config import OUTPUT_DIR

DECISIONS_FILE = os.path.join(OUTPUT_DIR, "simulated_decisions.csv")
FULL_DATASET_FILE = os.path.join(OUTPUT_DIR, "travel_buddy_ml_dataset.csv")
TRAIN_FILE = os.path.join(OUTPUT_DIR, "travel_buddy_ml_train.csv")
TEST_FILE = os.path.join(OUTPUT_DIR, "travel_buddy_ml_test.csv")


def balance_dataset(df):
    counts = df["label"].value_counts()
    min_count = counts.min()

    balanced_parts = []

    for label in sorted(df["label"].unique()):
        part = df[df["label"] == label]
        sampled = part.sample(n=min_count, random_state=42)
        balanced_parts.append(sampled)

    balanced_df = pd.concat(balanced_parts)
    balanced_df = balanced_df.sample(frac=1, random_state=42).reset_index(drop=True)

    return balanced_df


def main():
    if not os.path.exists(DECISIONS_FILE):
        raise FileNotFoundError("Run run_simulation.py first.")

    df = pd.read_csv(DECISIONS_FILE)

    print("Original dataset shape:", df.shape)
    print("Original label distribution:")
    print(df["label"].value_counts().sort_index())

    balanced_df = balance_dataset(df)

    print()
    print("Balanced dataset shape:", balanced_df.shape)
    print("Balanced label distribution:")
    print(balanced_df["label"].value_counts().sort_index())

    split_index = int(len(balanced_df) * 0.8)

    train_df = balanced_df.iloc[:split_index]
    test_df = balanced_df.iloc[split_index:]

    balanced_df.to_csv(FULL_DATASET_FILE, index=False)
    train_df.to_csv(TRAIN_FILE, index=False)
    test_df.to_csv(TEST_FILE, index=False)

    print()
    print("Generated:")
    print(FULL_DATASET_FILE)
    print(TRAIN_FILE)
    print(TEST_FILE)


if __name__ == "__main__":
    main()