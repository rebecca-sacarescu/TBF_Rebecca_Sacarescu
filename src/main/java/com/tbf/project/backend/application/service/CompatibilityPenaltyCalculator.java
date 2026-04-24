package com.tbf.project.backend.application.service;

import com.tbf.project.backend.entities.model.UserProfile;

import java.util.ArrayList;
import java.util.List;

public class CompatibilityPenaltyCalculator {

    private final ProfileVectorizer profileVectorizer;

    public CompatibilityPenaltyCalculator(ProfileVectorizer profileVectorizer) {
        this.profileVectorizer = profileVectorizer;
    }

    public PenaltyResult calculate(UserProfile source, UserProfile target) {
        double penaltyFactor = 1.0;
        List<String> penalties = new ArrayList<>();

        boolean sharedLanguages = profileVectorizer.hasSharedValues(source.getLanguages(), target.getLanguages());
        if (!sharedLanguages) {
            penaltyFactor *= 0.85;
            penalties.add("No shared languages");
        }

        int budgetDistance = Math.abs(
                profileVectorizer.toBudgetValue(source.getBudget()) -
                        profileVectorizer.toBudgetValue(target.getBudget())
        );
        if (budgetDistance == 2) {
            penaltyFactor *= 0.85;
            penalties.add("Large budget mismatch");
        }

        int planningDistance = Math.abs(
                profileVectorizer.toPlanningValue(source.getPlanningStyle()) -
                        profileVectorizer.toPlanningValue(target.getPlanningStyle())
        );
        if (planningDistance == 2) {
            penaltyFactor *= 0.90;
            penalties.add("Large planning mismatch");
        }

        int broadOverlap =
                profileVectorizer.overlapCount(source.getActivities(), target.getActivities()) +
                        profileVectorizer.overlapCount(source.getDestinationTypes(), target.getDestinationTypes()) +
                        profileVectorizer.overlapCount(source.getExperienceTypes(), target.getExperienceTypes()) +
                        profileVectorizer.overlapCount(source.getLookingForWhat(), target.getLookingForWhat());

        if (broadOverlap == 0) {
            penaltyFactor *= 0.90;
            penalties.add("Very low shared travel signals");
        }

        return new PenaltyResult(penaltyFactor, penalties);
    }

    public record PenaltyResult(
            double penaltyFactor,
            List<String> penalties
    ) {
    }
}