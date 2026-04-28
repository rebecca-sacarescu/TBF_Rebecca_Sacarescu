import random


PERSONAS = [
    "BUDGET_CONSCIOUS",
    "SOCIAL_EXPLORER",
    "CAUTIOUS_INTROVERT",
    "SELECTIVE_PLANNER",
    "SPONTANEOUS_ADVENTURER",
    "PASSIVE_BROWSER"
]


def choose_persona(profile):
    budget = profile["budget"]
    social = profile["social_battery"]
    planning = profile["planning_style"]

    if budget == "BUDGET_FRIENDLY":
        return "BUDGET_CONSCIOUS"

    if social == "INTROVERT":
        return "CAUTIOUS_INTROVERT"

    if social == "EXTROVERT":
        return "SOCIAL_EXPLORER"

    if planning == "STRICT_ITINERARY":
        return "SELECTIVE_PLANNER"

    if planning == "SPONTANEOUS":
        return "SPONTANEOUS_ADVENTURER"

    return random.choice(PERSONAS)


def persona_bias(persona, actor, target, features):
    bias = 0.0

    if persona == "BUDGET_CONSCIOUS":
        if features["budget_diff"] == 0:
            bias += 0.15
        elif features["budget_diff"] >= 2:
            bias -= 0.35

    elif persona == "SOCIAL_EXPLORER":
        if target["social_battery"] in ["EXTROVERT", "AMBIVERT"]:
            bias += 0.20
        else:
            bias -= 0.05

    elif persona == "CAUTIOUS_INTROVERT":
        if target["social_battery"] == "EXTROVERT":
            bias -= 0.20
        if features["shared_activities_count"] >= 2:
            bias += 0.15

    elif persona == "SELECTIVE_PLANNER":
        if features["same_planning_style"]:
            bias += 0.20
        else:
            bias -= 0.20

    elif persona == "SPONTANEOUS_ADVENTURER":
        if target["planning_style"] in ["SPONTANEOUS", "FLEXIBLE"]:
            bias += 0.18
        if features["shared_activities_count"] >= 1:
            bias += 0.10

    elif persona == "PASSIVE_BROWSER":
        bias -= 0.15

    return bias