import psycopg2
import pandas as pd
from config import DB_CONFIG


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


def list_actor_ids(limit=None):
    conn = get_connection()

    sql = """
        SELECT user_id
        FROM user_profiles
        ORDER BY user_id
    """

    if limit is not None:
        sql += f" LIMIT {int(limit)}"

    df = pd.read_sql(sql, conn)
    conn.close()

    return df["user_id"].tolist()


def get_profile(user_id):
    conn = get_connection()

    profile_sql = """
        SELECT 
            up.user_id,
            up.full_name,
            up.birth_date,
            up.gender,
            up.origin_country,
            up.origin_city,
            up.current_location,
            up.bio,
            up.social_battery,
            up.planning_style,
            up.budget
        FROM user_profiles up
        WHERE up.user_id = %s
    """

    attrs_sql = """
        SELECT 
            pa.category,
            pa.attribute_value
        FROM profile_attributes pa
        JOIN user_profiles up ON up.id = pa.profile_id
        WHERE up.user_id = %s
    """

    profile_df = pd.read_sql(profile_sql, conn, params=(user_id,))
    attrs_df = pd.read_sql(attrs_sql, conn, params=(user_id,))
    conn.close()

    if profile_df.empty:
        return None

    profile = profile_df.iloc[0].to_dict()

    attributes = {}
    for _, row in attrs_df.iterrows():
        category = row["category"]
        value = row["attribute_value"]

        attributes.setdefault(category, [])
        attributes[category].append(value)

    profile["attributes"] = attributes

    return profile


def list_candidates(actor_user_id, limit=20):
    conn = get_connection()

    sql = """
        SELECT up.user_id
        FROM user_profiles up
        WHERE up.user_id <> %s
        ORDER BY random()
        LIMIT %s
    """

    df = pd.read_sql(sql, conn, params=(actor_user_id, limit))
    conn.close()

    return df["user_id"].tolist()