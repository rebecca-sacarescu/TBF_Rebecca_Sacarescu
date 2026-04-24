package com.tbf.project.backend.application.service;

import com.tbf.project.backend.entities.model.UserProfile;
import com.tbf.project.backend.entities.model.enums.Budget;
import com.tbf.project.backend.entities.model.enums.PlanningStyle;
import com.tbf.project.backend.entities.model.enums.SocialBattery;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ProfileVectorizer {

    public int toBudgetValue(Budget budget) {
        if (budget == null) {
            return 0;
        }

        return switch (budget) {
            case BUDGET_FRIENDLY -> 1;
            case MODERATE -> 2;
            case LUXURY -> 3;
        };
    }

    public int toPlanningValue(PlanningStyle planningStyle) {
        if (planningStyle == null) {
            return 0;
        }

        return switch (planningStyle) {
            case SPONTANEOUS -> 1;
            case FLEXIBLE -> 2;
            case STRICT_ITINERARY -> 3;
        };
    }

    public int toSocialValue(SocialBattery socialBattery) {
        if (socialBattery == null) {
            return 0;
        }

        return switch (socialBattery) {
            case INTROVERT -> 1;
            case AMBIVERT -> 2;
            case EXTROVERT -> 3;
        };
    }

    public Set<String> normalizeSet(List<String> values) {
        Set<String> normalized = new HashSet<>();

        if (values == null) {
            return normalized;
        }

        for (String value : values) {
            if (value != null && !value.isBlank()) {
                normalized.add(value.trim().toLowerCase());
            }
        }

        return normalized;
    }

    public boolean hasSharedValues(List<String> first, List<String> second) {
        Set<String> firstSet = normalizeSet(first);
        Set<String> secondSet = normalizeSet(second);

        firstSet.retainAll(secondSet);
        return !firstSet.isEmpty();
    }

    public int overlapCount(List<String> first, List<String> second) {
        Set<String> firstSet = normalizeSet(first);
        Set<String> secondSet = normalizeSet(second);

        firstSet.retainAll(secondSet);
        return firstSet.size();
    }

    public boolean hasEnoughProfileData(UserProfile profile) {
        return profile != null
                && profile.getBudget() != null
                && profile.getPlanningStyle() != null
                && profile.getSocialBattery() != null;
    }
}