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

    private String buildPrompt(
            Trip trip,
            UserProfile requester,
            List<UserProfile> crewProfiles,
            GenerateTripPlanInputDto input
    ) {
        long tripDays = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate());
        if (tripDays <= 0) tripDays = 1;

        // Crew aggregate stats
        Map<Budget, Long> budgetFreq = crewProfiles.stream()
                .filter(p -> p.getBudget() != null)
                .collect(Collectors.groupingBy(UserProfile::getBudget, Collectors.counting()));
        Budget dominantBudget = budgetFreq.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(trip.getBudget());

        Map<SocialBattery, Long> socialFreq = crewProfiles.stream()
                .filter(p -> p.getSocialBattery() != null)
                .collect(Collectors.groupingBy(UserProfile::getSocialBattery, Collectors.counting()));
        SocialBattery dominantSocial = socialFreq.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(requester.getSocialBattery());

        Map<PlanningStyle, Long> planningFreq = crewProfiles.stream()
                .filter(p -> p.getPlanningStyle() != null)
                .collect(Collectors.groupingBy(UserProfile::getPlanningStyle, Collectors.counting()));
        PlanningStyle dominantPlanning = planningFreq.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(requester.getPlanningStyle());

        // Top shared activities
        Map<String, Long> activityFreq = crewProfiles.stream()
                .filter(p -> p.getActivities() != null)
                .flatMap(p -> p.getActivities().stream())
                .collect(Collectors.groupingBy(a -> a, Collectors.counting()));
        List<String> topActivities = activityFreq.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // Top shared languages
        Map<String, Long> langFreq = crewProfiles.stream()
                .filter(p -> p.getLanguages() != null)
                .flatMap(p -> p.getLanguages().stream())
                .collect(Collectors.groupingBy(l -> l, Collectors.counting()));
        List<String> topLanguages = langFreq.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        String userPromptSection = (input.userPrompt() != null && !input.userPrompt().isBlank())
                ? "Additional request from the traveler: " + input.userPrompt().trim()
                : "";

        return String.format("""
                You are an expert travel planner. Generate a detailed, realistic trip itinerary strictly in JSON format.
                
                TRIP DETAILS:
                - Destination: %s, %s
                - Duration: %d days (from %s to %s)
                - Trip type: %s
                - Trip budget level: %s
                
                CREW PROFILE (%d travelers):
                - Dominant budget style: %s
                - Dominant social battery: %s
                - Dominant planning style: %s
                - Top shared activities: %s
                - Shared languages: %s
                
                %s
                
                IMPORTANT: Respond ONLY with a valid JSON object, no markdown, no explanation, no backticks.
                JSON structure:
                {
                  "title": "catchy itinerary title",
                  "summary": "2-3 sentence overview of the trip experience",
                  "estimatedBudgetPerPerson": "e.g. €300-500",
                  "days": [
                    {
                      "dayNumber": 1,
                      "theme": "short theme for the day",
                      "activities": [
                        {
                          "time": "Morning / Afternoon / Evening / Night",
                          "name": "activity name",
                          "description": "1-2 sentence description",
                          "estimatedCost": "e.g. Free / €15 / €30-50",
                          "tip": "practical insider tip"
                        }
                      ]
                    }
                  ],
                  "generalTips": ["tip1", "tip2", "tip3"],
                  "neighborhoods": ["neighborhood1", "neighborhood2"]
                }
                """,
                trip.getDestinationCity(),
                trip.getDestinationCountry(),
                tripDays,
                trip.getStartDate(),
                trip.getEndDate(),
                formatEnum(trip.getTripType()),
                formatEnum(trip.getBudget()),
                crewProfiles.size(),
                formatEnum(dominantBudget),
                formatEnum(dominantSocial),
                formatEnum(dominantPlanning),
                topActivities.isEmpty() ? "not specified" : String.join(", ", topActivities),
                topLanguages.isEmpty() ? "not specified" : String.join(", ", topLanguages),
                userPromptSection
        );
    }

    private String formatEnum(Enum<?> e) {
        if (e == null) return "not specified";
        return e.name().replace("_", " ");
    }
}