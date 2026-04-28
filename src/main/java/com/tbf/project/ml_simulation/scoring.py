BUDGET_MAP = {
    "BUDGET_FRIENDLY": 1,
    "MODERATE": 2,
    "LUXURY": 3
}

PLANNING_MAP = {
    "SPONTANEOUS": 1,
    "FLEXIBLE": 2,
    "STRICT_ITINERARY": 3
}

SOCIAL_MAP = {
    "INTROVERT": 1,
    "AMBIVERT": 2,
    "EXTROVERT": 3
}


def safe_set(profile, category):
    return set(profile.get("attributes", {}).get(category, []))


def jaccard(a, b):
    if not a and not b:
        return 0.0
    return len(a & b) / len(a | b)


def compute_pair_features(actor, target):
    actor_budget = BUDGET_MAP[actor["budget"]]
    target_budget = BUDGET_MAP[target["budget"]]

    actor_planning = PLANNING_MAP[actor["planning_style"]]
    target_planning = PLANNING_MAP[target["planning_style"]]

    actor_social = SOCIAL_MAP[actor["social_battery"]]
    target_social = SOCIAL_MAP[target["social_battery"]]

    budget_diff = abs(actor_budget - target_budget)
    planning_diff = abs(actor_planning - target_planning)
    social_diff = abs(actor_social - target_social)

    actor_languages = safe_set(actor, "LANGUAGE")
    target_languages = safe_set(target, "LANGUAGE")

    actor_activities = safe_set(actor, "ACTIVITY")
    target_activities = safe_set(target, "ACTIVITY")

    actor_destinations = safe_set(actor, "DESTINATION_TYPE")
    target_destinations = safe_set(target, "DESTINATION_TYPE")

    actor_experiences = safe_set(actor, "EXPERIENCE_TYPE")
    target_experiences = safe_set(target, "EXPERIENCE_TYPE")

    actor_looking_for = safe_set(actor, "LOOKING_FOR_WHAT")
    target_looking_for = safe_set(target, "LOOKING_FOR_WHAT")

    enum_score = 1 - ((budget_diff + planning_diff + social_diff) / 6)

    language_score = jaccard(actor_languages, target_languages)
    activity_score = jaccard(actor_activities, target_activities)
    destination_score = jaccard(actor_destinations, target_destinations)
    experience_score = jaccard(actor_experiences, target_experiences)
    intent_score = jaccard(actor_looking_for, target_looking_for)

    static_score = (
                           enum_score * 0.35 +
                           language_score * 0.20 +
                           activity_score * 0.20 +
                           destination_score * 0.10 +
                           experience_score * 0.10 +
                           intent_score * 0.05
                   ) * 100

    return {
        "budget_diff": budget_diff,
        "planning_diff": planning_diff,
        "social_diff": social_diff,

        "same_budget": int(actor["budget"] == target["budget"]),
        "same_planning_style": int(actor["planning_style"] == target["planning_style"]),
        "same_social_battery": int(actor["social_battery"] == target["social_battery"]),

        "shared_languages_count": len(actor_languages & target_languages),
        "shared_activities_count": len(actor_activities & target_activities),
        "shared_destination_types_count": len(actor_destinations & target_destinations),
        "shared_experience_types_count": len(actor_experiences & target_experiences),
        "shared_looking_for_what_count": len(actor_looking_for & target_looking_for),

        "language_score": round(language_score, 4),
        "activity_score": round(activity_score, 4),
        "destination_score": round(destination_score, 4),
        "experience_score": round(experience_score, 4),
        "intent_score": round(intent_score, 4),

        "static_score": round(static_score, 2)
    }