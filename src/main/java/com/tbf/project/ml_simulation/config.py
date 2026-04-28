import os

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "TBF",
    "user": "postgres",
    "password": "rebecca"
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

RANDOM_SEED = 42
CANDIDATES_PER_USER = 20
MAX_USERS = 1000