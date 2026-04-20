import random
import re
from datetime import datetime, timedelta

import psycopg2
from psycopg2.extras import execute_values

from name_loader import load_names_from_file


DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "TBF",
    "user": "postgres",
    "password": "rebecca",
}

USER_COUNT = 1000
SEED_EMAIL_PREFIX = "seed_tb_"

# BCrypt pentru "password"
PASSWORD_HASH = "$2a$10$7EqJtq98hPqEX7fNZaFWoOhiHfY4v1bRzGQ9WavH0I1GtIsfRSA0W"

FULL_NAMES = load_names_from_file("nume.txt")

LOCATIONS = {
    "Romania": ["Bucharest", "Cluj-Napoca", "Iasi", "Timisoara", "Constanta", "Brasov", "Sibiu", "Oradea", "Craiova", "Galati"],
    "France": ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Bordeaux", "Nantes", "Strasbourg", "Lille", "Montpellier"],
    "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Dusseldorf", "Leipzig", "Dresden", "Bremen"],
    "Italy": ["Rome", "Milan", "Naples", "Turin", "Palermo", "Bologna", "Florence", "Venice", "Verona", "Bari"],
    "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Malaga", "Bilbao", "Alicante", "Cordoba", "Granada"],
    "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Tilburg", "Breda", "Haarlem", "Nijmegen"],
    "Belgium": ["Brussels", "Antwerp", "Ghent", "Bruges", "Liege", "Charleroi", "Namur", "Leuven", "Mons", "Mechelen"],
    "Austria": ["Vienna", "Salzburg", "Graz", "Linz", "Innsbruck", "Klagenfurt", "Villach", "Wels", "St. Polten", "Dornbirn"],
    "Poland": ["Warsaw", "Krakow", "Gdansk", "Wroclaw", "Poznan", "Lodz", "Lublin", "Katowice", "Szczecin", "Bydgoszcz"],
    "Czechia": ["Prague", "Brno", "Ostrava", "Plzen", "Liberec", "Olomouc", "Ceske Budejovice", "Hradec Kralove", "Pardubice", "Zlin"],
    "Greece": ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos", "Ioannina", "Chania", "Kavala", "Rhodes"],
    "Sweden": ["Stockholm", "Gothenburg", "Malmo", "Uppsala", "Vasteras", "Orebro", "Linkoping", "Helsingborg", "Jonkoping", "Lund"],
    "Norway": ["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromso", "Kristiansand", "Drammen", "Fredrikstad", "Skien", "Alesund"],
    "Switzerland": ["Zurich", "Geneva", "Basel", "Lausanne", "Bern", "Lucerne", "St. Gallen", "Lugano", "Winterthur", "Fribourg"],
    "USA": ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "San Francisco", "Dallas", "Seattle", "Boston", "Atlanta"],
    "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Quebec City", "Winnipeg", "Halifax", "Victoria"],
    "Brazil": ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Fortaleza", "Recife", "Porto Alegre", "Curitiba", "Manaus", "Belo Horizonte"],
    "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo", "Kobe", "Fukuoka", "Hiroshima", "Sendai"],
    "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Hobart", "Darwin", "Gold Coast", "Newcastle"],
    "India": ["Delhi", "Mumbai", "Bangalore", "Kolkata", "Chennai", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"],
}

SOCIAL_BATTERY = ["INTROVERT", "AMBIVERT", "EXTROVERT"]
PLANNING_STYLE = ["SPONTANEOUS", "FLEXIBLE", "STRICT_ITINERARY"]
BUDGET = ["BUDGET_FRIENDLY", "MODERATE", "LUXURY"]
VERIFICATION = ["UNVERIFIED", "PENDING", "VERIFIED_USER"]
GENDERS = ["FEMALE", "MALE", "NON_BINARY"]

BIOS = [
    "Love discovering new places and meeting like-minded travelers.",
    "Looking for travel buddies for city breaks, food adventures, and spontaneous plans.",
    "I enjoy cultural trips, beautiful views, and good conversations.",
    "Open to new travel experiences, from chill escapes to adventurous weekends.",
    "Trying to find compatible people to explore the world with.",
    "Big fan of local food, cozy cafés, and meaningful travel experiences.",
    "I like trips that balance planning with room for spontaneity.",
    "Looking for people who enjoy exploring, walking, and making memories.",
]

ARCHETYPES = [
    {
        "name": "budget_backpacker",
        "activities": ["HIKING", "ROAD_TRIPS", "HOSTELS", "PHOTOGRAPHY"],
        "destinations": ["MOUNTAINS", "COUNTRYSIDE"],
        "experiences": ["ADVENTURE"],
        "languages": ["ENGLISH", "SPANISH", "GERMAN"],
        "who": ["GROUP", "SOLO_TRAVEL_BUDDY"],
        "what": ["BACKPACKING", "WEEKEND_ESCAPE"],
        "social_bias": "EXTROVERT",
        "planning_bias": "SPONTANEOUS",
        "budget_bias": "BUDGET_FRIENDLY",
    },
    {
        "name": "luxury_city_explorer",
        "activities": ["MUSEUMS", "FOOD", "SHOPPING", "CAFE_HOPPING"],
        "destinations": ["CITY_BREAK"],
        "experiences": ["CULTURAL", "FOODIE"],
        "languages": ["ENGLISH", "FRENCH", "ITALIAN"],
        "who": ["SOLO_TRAVEL_BUDDY"],
        "what": ["VACATION", "CITY_BREAK"],
        "social_bias": "AMBIVERT",
        "planning_bias": "FLEXIBLE",
        "budget_bias": "LUXURY",
    },
    {
        "name": "nature_slow_traveler",
        "activities": ["HIKING", "PHOTOGRAPHY", "BEACH", "READING"],
        "destinations": ["COUNTRYSIDE", "MOUNTAINS", "ISLANDS"],
        "experiences": ["RELAXATION"],
        "languages": ["ENGLISH", "ROMANIAN", "GERMAN"],
        "who": ["SOLO_TRAVEL_BUDDY"],
        "what": ["WEEKEND_ESCAPE", "VACATION"],
        "social_bias": "INTROVERT",
        "planning_bias": "FLEXIBLE",
        "budget_bias": "MODERATE",
    },
    {
        "name": "party_traveler",
        "activities": ["NIGHTLIFE", "FESTIVALS", "BEACH", "FOOD"],
        "destinations": ["BEACH", "CITY_BREAK"],
        "experiences": ["PARTY"],
        "languages": ["ENGLISH", "SPANISH"],
        "who": ["GROUP"],
        "what": ["VACATION"],
        "social_bias": "EXTROVERT",
        "planning_bias": "SPONTANEOUS",
        "budget_bias": "MODERATE",
    },
    {
        "name": "culture_first_planner",
        "activities": ["MUSEUMS", "PHOTOGRAPHY", "FOOD", "WALKING_TOURS"],
        "destinations": ["CITY_BREAK"],
        "experiences": ["CULTURAL"],
        "languages": ["ENGLISH", "FRENCH", "ITALIAN"],
        "who": ["SOLO_TRAVEL_BUDDY"],
        "what": ["CITY_BREAK", "LONG_TERM_TRAVEL"],
        "social_bias": "AMBIVERT",
        "planning_bias": "STRICT_ITINERARY",
        "budget_bias": "MODERATE",
    },
    {
        "name": "digital_nomad",
        "activities": ["CAFE_HOPPING", "PHOTOGRAPHY", "FOOD", "CITY_WALKS"],
        "destinations": ["CITY_BREAK"],
        "experiences": ["RELAXATION", "CULTURAL"],
        "languages": ["ENGLISH", "SPANISH", "FRENCH", "GERMAN"],
        "who": ["SOLO_TRAVEL_BUDDY"],
        "what": ["LONG_TERM_TRAVEL"],
        "social_bias": "AMBIVERT",
        "planning_bias": "FLEXIBLE",
        "budget_bias": "MODERATE",
    },
    {
        "name": "comfort_traveler",
        "activities": ["BEACH", "FOOD", "SHOPPING", "MUSEUMS"],
        "destinations": ["BEACH", "CITY_BREAK", "ISLANDS"],
        "experiences": ["RELAXATION"],
        "languages": ["ENGLISH", "ITALIAN"],
        "who": ["COUPLE_FRIENDLY", "GROUP"],
        "what": ["VACATION"],
        "social_bias": "AMBIVERT",
        "planning_bias": "FLEXIBLE",
        "budget_bias": "LUXURY",
    },
    {
        "name": "adrenaline_seeker",
        "activities": ["HIKING", "ROAD_TRIPS", "FESTIVALS", "EXTREME_SPORTS"],
        "destinations": ["MOUNTAINS", "COUNTRYSIDE"],
        "experiences": ["ADVENTURE"],
        "languages": ["ENGLISH", "SPANISH"],
        "who": ["GROUP"],
        "what": ["BACKPACKING", "LONG_TERM_TRAVEL"],
        "social_bias": "EXTROVERT",
        "planning_bias": "SPONTANEOUS",
        "budget_bias": "MODERATE",
    },
]


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return text.strip("_")


def weighted_pick(values, weights):
    return random.choices(values, weights=weights, k=1)[0]


def biased_enum(default_value, values, bias_strength=0.55):
    if random.random() < bias_strength:
        return default_value
    others = [v for v in values if v != default_value]
    return random.choice(others)


def random_birth_date():
    start = datetime(1988, 1, 1)
    end = datetime(2005, 12, 31)
    delta_days = (end - start).days
    return (start + timedelta(days=random.randint(0, delta_days))).date()


def choose_origin_and_current():
    origin_country = weighted_pick(
        list(LOCATIONS.keys()),
        [12, 8, 8, 8, 8, 5, 4, 4, 5, 4, 4, 3, 3, 3, 6, 4, 4, 4, 4, 5]
    )
    origin_city = random.choice(LOCATIONS[origin_country])

    if random.random() < 0.72:
        current_country = origin_country
        current_city = random.choice(LOCATIONS[current_country])
    else:
        current_country = random.choice(list(LOCATIONS.keys()))
        current_city = random.choice(LOCATIONS[current_country])

    return origin_country, origin_city, f"{current_city}, {current_country}"


def ensure_enough_names():
    global FULL_NAMES

    FULL_NAMES = list(dict.fromkeys(FULL_NAMES))

    if len(FULL_NAMES) < USER_COUNT:
        extra_needed = USER_COUNT - len(FULL_NAMES)
        print(f"Am găsit doar {len(FULL_NAMES)} nume. Generez încă {extra_needed} nume suplimentare...")

        first_names = [n.split()[0] for n in FULL_NAMES if len(n.split()) >= 2]
        last_names = [n.split()[-1] for n in FULL_NAMES if len(n.split()) >= 2]

        generated = set(FULL_NAMES)

        while len(FULL_NAMES) < USER_COUNT:
            new_name = f"{random.choice(first_names)} {random.choice(last_names)}"
            if new_name not in generated:
                FULL_NAMES.append(new_name)
                generated.add(new_name)

    print(f"Total names available: {len(FULL_NAMES)}")


def build_attributes(archetype):
    attrs = []

    langs = {"ENGLISH"}
    if random.random() < 0.45:
        langs.add(random.choice(archetype["languages"]))
    if random.random() < 0.20:
        langs.add(random.choice(["ROMANIAN", "SPANISH", "FRENCH", "GERMAN", "ITALIAN"]))

    activities = set(random.sample(archetype["activities"], k=min(len(archetype["activities"]), random.randint(2, 4))))
    if random.random() < 0.25:
        activities.add(random.choice([
            "MUSEUMS", "FOOD", "HIKING", "NIGHTLIFE", "PHOTOGRAPHY",
            "SHOPPING", "BEACH", "ROAD_TRIPS", "CAFE_HOPPING"
        ]))

    destinations = set(random.sample(archetype["destinations"], k=min(len(archetype["destinations"]), random.randint(1, 2))))
    experiences = set(random.sample(archetype["experiences"], k=1))
    looking_who = {random.choice(archetype["who"])}
    looking_what = {random.choice(archetype["what"])}

    for v in activities:
        attrs.append(("ACTIVITY", v))
    for v in langs:
        attrs.append(("LANGUAGE", v))
    for v in destinations:
        attrs.append(("DESTINATION_TYPE", v))
    for v in experiences:
        attrs.append(("EXPERIENCE_TYPE", v))
    for v in looking_who:
        attrs.append(("LOOKING_FOR_WHO", v))
    for v in looking_what:
        attrs.append(("LOOKING_FOR_WHAT", v))

    return list(dict.fromkeys(attrs))


def main():
    ensure_enough_names()

    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COALESCE(MAX(id), 0) FROM users")
            max_user_id = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM users WHERE email LIKE %s", (f"{SEED_EMAIL_PREFIX}%",))
            existing_seed = cur.fetchone()[0]

            print(f"MAX(id) existent: {max_user_id}")
            print(f"Useri seed existenți: {existing_seed}")

            start_id = max_user_id + 1
            selected_names = FULL_NAMES[:USER_COUNT]

            users_rows = []
            profile_rows = []
            attributes_rows = []

            for idx, full_name in enumerate(selected_names):
                user_id = start_id + idx
                first_name = full_name.split()[0]

                username = f"{slugify(first_name)}_{user_id}"
                email = f"{SEED_EMAIL_PREFIX}{user_id}@mail.com"
                created_at = datetime.now() - timedelta(days=random.randint(0, 365))

                users_rows.append((
                    user_id,
                    email,
                    PASSWORD_HASH,
                    username,
                    created_at
                ))

                origin_country, origin_city, current_location = choose_origin_and_current()
                archetype = random.choice(ARCHETYPES)

                social = biased_enum(archetype["social_bias"], SOCIAL_BATTERY)
                planning = biased_enum(archetype["planning_bias"], PLANNING_STYLE)
                budget = biased_enum(archetype["budget_bias"], BUDGET)
                verification = weighted_pick(VERIFICATION, [0.55, 0.25, 0.20])
                gender = weighted_pick(GENDERS, [0.48, 0.48, 0.04])

                profile_picture_url = None
                if random.random() >= 0.35:
                    profile_picture_url = f"https://api.dicebear.com/7.x/adventurer/svg?seed={user_id}"

                profile_rows.append((
                    user_id,                    # user_id
                    full_name,                 # full_name
                    random_birth_date(),       # birth_date
                    gender,                    # gender
                    origin_country,            # origin_country
                    origin_city,               # origin_city
                    profile_picture_url,       # profile_picture_url
                    random.choice(BIOS),       # bio
                    verification,              # verification_status
                    social,                    # social_battery
                    planning,                  # planning_style
                    budget,                    # budget
                    created_at,                # created_at
                    created_at,                # updated_at
                    current_location           # current_location
                ))

            execute_values(
                cur,
                """
                INSERT INTO users (id, email, password, username, created_at)
                VALUES %s
                """,
                users_rows,
                page_size=200
            )

            execute_values(
                cur,
                """
                INSERT INTO user_profiles (
                    user_id,
                    full_name,
                    birth_date,
                    gender,
                    origin_country,
                    origin_city,
                    profile_picture_url,
                    bio,
                    verification_status,
                    social_battery,
                    planning_style,
                    budget,
                    created_at,
                    updated_at,
                    current_location
                )
                VALUES %s
                """,
                profile_rows,
                page_size=200
            )

            cur.execute("""
                SELECT up.user_id, up.id
                FROM user_profiles up
                JOIN users u ON u.id = up.user_id
                WHERE u.email LIKE %s
            """, (f"{SEED_EMAIL_PREFIX}%",))
            user_to_profile = dict(cur.fetchall())

            for idx, _full_name in enumerate(selected_names):
                user_id = start_id + idx
                profile_id = user_to_profile[user_id]
                archetype = random.choice(ARCHETYPES)
                attrs = build_attributes(archetype)

                for category, value in attrs:
                    attributes_rows.append((profile_id, category, value))

            execute_values(
                cur,
                """
                INSERT INTO profile_attributes (profile_id, category, attribute_value)
                VALUES %s
                """,
                attributes_rows,
                page_size=500
            )

            conn.commit()
            print(
                f"Seed complet: {len(users_rows)} users, "
                f"{len(profile_rows)} profiles, "
                f"{len(attributes_rows)} attributes."
            )

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()