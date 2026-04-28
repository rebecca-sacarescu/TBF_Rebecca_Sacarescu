import random
from config import RANDOM_SEED, CANDIDATES_PER_USER, MAX_USERS
from db import list_actor_ids
from tools_core import simulate_user

random.seed(RANDOM_SEED)


def main():
    actor_ids = list_actor_ids(limit=MAX_USERS)

    total = len(actor_ids)

    for index, actor_user_id in enumerate(actor_ids, start=1):
        print(f"[{index}/{total}] Simulating actor user {actor_user_id}")
        simulate_user(actor_user_id, CANDIDATES_PER_USER)

    print("Simulation finished.")
    print("Generated files:")
    print("output/simulated_events.csv")
    print("output/simulated_interactions.csv")
    print("output/simulated_saved_profiles.csv")
    print("output/simulated_decisions.csv")


if __name__ == "__main__":
    main()