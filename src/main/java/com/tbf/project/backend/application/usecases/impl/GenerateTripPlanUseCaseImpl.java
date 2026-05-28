package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.AiTripPlanResponseDto;
import com.tbf.project.backend.application.dto.GenerateTripPlanInputDto;
import com.tbf.project.backend.application.mapper.AiTripPlanMapper;
import com.tbf.project.backend.application.usecases.GenerateTripPlanUseCase;
import com.tbf.project.backend.entities.gateway.*;
import com.tbf.project.backend.entities.model.*;
import com.tbf.project.backend.entities.model.enums.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

public class GenerateTripPlanUseCaseImpl implements GenerateTripPlanUseCase {

    private final TripGateway tripGateway;
    private final TripMemberGateway tripMemberGateway;
    private final ProfileGateway profileGateway;
    private final AiTripPlanGateway aiTripPlanGateway;
    private final AiPlannerGateway aiPlannerGateway;
    private final AiTripPlanMapper aiTripPlanMapper;

    public GenerateTripPlanUseCaseImpl(
            TripGateway tripGateway,
            TripMemberGateway tripMemberGateway,
            ProfileGateway profileGateway,
            AiTripPlanGateway aiTripPlanGateway,
            AiPlannerGateway aiPlannerGateway,
            AiTripPlanMapper aiTripPlanMapper
    ) {
        this.tripGateway = tripGateway;
        this.tripMemberGateway = tripMemberGateway;
        this.profileGateway = profileGateway;
        this.aiTripPlanGateway = aiTripPlanGateway;
        this.aiPlannerGateway = aiPlannerGateway;
        this.aiTripPlanMapper = aiTripPlanMapper;
    }

    @Override
    public AiTripPlanResponseDto execute(Long currentUserId, Long tripId, GenerateTripPlanInputDto input) {

        // 1. Validate trip exists
        Trip trip = tripGateway.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        // 2. Validate current user is ACTIVE member
        boolean isActiveMember = tripMemberGateway.existsActiveByTripIdAndUserId(tripId, currentUserId);
        if (!isActiveMember) {
            throw new SecurityException("You are not an active member of this trip");
        }

        // 3. Load current user profile for personalization
        UserProfile requesterProfile = profileGateway.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User profile not found"));

        // 4. Load all active members + their profiles (Crew context — Option C)
        List<TripMember> activeMembers = tripMemberGateway.findAllActiveByTripId(tripId);
        List<Long> memberUserIds = activeMembers.stream()
                .map(TripMember::getUserId)
                .collect(Collectors.toList());
        List<UserProfile> memberProfiles = profileGateway.findAllByUserIds(memberUserIds);

        // 5. Build the enriched prompt
        String prompt = buildPrompt(trip, requesterProfile, memberProfiles, input);

        // 6. Call Gemini
        String planJson = aiPlannerGateway.generateTripPlan(prompt);

        // 7. Save or update in DB (Option B)
        AiTripPlan saved = aiTripPlanGateway.findByTripId(tripId)
                .map(existing -> {
                    existing.setPlanJson(planJson);
                    existing.setGeneratedByUserId(currentUserId);
                    existing.setUpdatedAt(java.time.LocalDateTime.now());
                    return aiTripPlanGateway.save(existing);
                })
                .orElseGet(() -> {
                    AiTripPlan newPlan = aiTripPlanMapper.toDomain(tripId, currentUserId, planJson);
                    return aiTripPlanGateway.save(newPlan);
                });

        // 8. Map and return
        String generatedByName = requesterProfile.getFullName();
        return aiTripPlanMapper.toDto(saved, generatedByName);
    }

    private String buildPrompt(Trip trip, UserProfile requester, List<UserProfile> crewProfiles, GenerateTripPlanInputDto input) {
        long tripDays = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate());
        if (tripDays <= 0) tripDays = 1;

        String userPromptSection = (input.userPrompt() != null && !input.userPrompt().isBlank())
                ? "Extra: " + input.userPrompt().trim()
                : "";

        return String.format("""
            Create a short trip plan for %s, %s (%d days, %s budget, %s style).
            Group: %d people.
            %s
            
            Reply ONLY with this exact JSON, nothing else:
            {"title":"...","summary":"one sentence","estimatedBudgetPerPerson":"e.g. 200-400 EUR","days":[{"dayNumber":1,"theme":"...","activities":[{"time":"Morning","name":"place name","description":"one sentence","estimatedCost":"Free","tip":"short tip"},{"time":"Afternoon","name":"place name","description":"one sentence","estimatedCost":"10 EUR","tip":"short tip"}]}],"generalTips":["tip1","tip2"],"neighborhoods":["area1"]}
            
            Keep descriptions under 10 words each. Maximum 2 activities per day.
            """,
                trip.getDestinationCity(),
                trip.getDestinationCountry(),
                tripDays,
                formatEnum(trip.getBudget()),
                formatEnum(trip.getTripType()),
                crewProfiles.size(),
                userPromptSection
        );
    }

    private String formatEnum(Enum<?> e) {
        if (e == null) return "not specified";
        return e.name().replace("_", " ");
    }
}