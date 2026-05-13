import psycopg2
from config import DB_CONFIG


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


def make_json_safe(value):
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, (int, float, bool, str)):
        return value
    return str(value)


def list_actor_ids(limit=None):
    conn = get_connection()
    cursor = conn.cursor()

    sql = """
        SELECT user_id
        FROM user_profiles
        ORDER BY user_id
    """

    if limit is not None:
        sql += " LIMIT %s"
        cursor.execute(sql, (int(limit),))
    else:
        cursor.execute(sql)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [int(row[0]) for row in rows]


def get_profile(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT 
            user_id,
            full_name,
            birth_date,
            gender,
            origin_country,
            origin_city,
            current_location,
            bio,
            social_battery,
            planning_style,
            budget
        FROM user_profiles
        WHERE user_id = %s
        """,
        (int(user_id),)
    )

    row = cursor.fetchone()

    if row is None:
        cursor.close()
        conn.close()
        return None

    columns = [
        "user_id",
        "full_name",
        "birth_date",
        "gender",
        "origin_country",
        "origin_city",
        "current_location",
        "bio",
        "social_battery",
        "planning_style",
        "budget"
    ]

    profile = {
        column: make_json_safe(value)
        for column, value in zip(columns, row)
    }

    cursor.execute(
        """
        SELECT 
            pa.category,
            pa.attribute_value
        FROM profile_attributes pa
        JOIN user_profiles up ON up.id = pa.profile_id
        WHERE up.user_id = %s
        ORDER BY pa.category, pa.attribute_value
        """,
        (int(user_id),)
    )

    attributes = {}

    for category, attribute_value in cursor.fetchall():
        category = str(category)
        attribute_value = str(attribute_value)

        attributes.setdefault(category, [])
        attributes[category].append(attribute_value)

    profile["attributes"] = attributes

    cursor.close()
    conn.close()

    return profile


def list_candidates(actor_user_id, limit=20):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT up.user_id
        FROM user_profiles up
        WHERE up.user_id <> %s
        ORDER BY random()
        LIMIT %s
        """,
        (int(actor_user_id), int(limit))
    )

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [int(row[0]) for row in rows]