import argparse
import csv
import os
import sys
import psycopg2
from psycopg2.extras import execute_values

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "TBF"
DB_USER = "postgres"
DB_PASSWORD = "rebecca"

DEFAULT_CSV = os.path.join(os.path.dirname(__file__), "output", "simulated_events.csv")


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", default=DEFAULT_CSV)
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def load_csv(path):
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            dwell = row["dwell_time_ms"].strip()
            rows.append((
                int(row["actor_user_id"]),
                int(row["target_user_id"]),
                row["event_type"].strip(),
                row["surface"].strip(),
                int(dwell) if dwell else None,
                row["created_at"].strip() if row["created_at"].strip() else None,
            ))
    return rows


def import_events(rows, dry_run=False):
    if dry_run:
        print("DRY RUN — first 5 rows:")
        for r in rows[:5]:
            print(r)
        print(f"\nTotal rows to import: {len(rows)}")
        return

    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT,
        dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )
    cur = conn.cursor()

    query = """
        INSERT INTO profile_interaction_events
            (actor_user_id, target_user_id, event_type, surface, dwell_time_ms, created_at)
        VALUES %s
        ON CONFLICT DO NOTHING
    """

    try:
        execute_values(cur, query, rows, page_size=500)
        inserted = cur.rowcount
        conn.commit()
        print(f"Import complete: {inserted} rows inserted out of {len(rows)} total.")
    except Exception as e:
        conn.rollback()
        print(f"Import failed: {e}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    args = parse_args()

    if not os.path.exists(args.csv):
        print(f"CSV not found: {args.csv}")
        sys.exit(1)

    print(f"Reading {args.csv} ...")
    rows = load_csv(args.csv)
    print(f"Rows loaded: {len(rows)}")

    import_events(rows, dry_run=args.dry_run)