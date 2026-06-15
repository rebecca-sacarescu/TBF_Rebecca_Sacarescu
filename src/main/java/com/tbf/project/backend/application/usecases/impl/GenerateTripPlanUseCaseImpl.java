package com.tbf.project.backend.application.usecases.impl;

import com.tbf.project.backend.application.dto.AiTripPlanResponseDto;
import com.tbf.project.backend.application.dto.GenerateTripPlanInputDto;
import com.tbf.project.backend.application.mapper.AiTripPlanMapper;
import com.tbf.project.backend.application.usecases.GenerateTripPlanUseCase;
import com.tbf.project.backend.entities.gateway.*;
import com.tbf.project.backend.entities.model.*;
import com.tbf.project.backend.entities.model.enums.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
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

        Trip trip = tripGateway.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        boolean isActiveMember = tripMemberGateway.existsActiveByTripIdAndUserId(tripId, currentUserId);
        if (!isActiveMember) {
            throw new SecurityException("You are not an active member of this trip");
        }

        UserProfile requesterProfile = profileGateway.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User profile not found"));

        List<TripMember> activeMembers = tripMemberGateway.findAllActiveByTripId(tripId);
        List<Long> memberUserIds = activeMembers.stream()
                .map(TripMember::getUserId)
                .collect(Collectors.toList());
        List<UserProfile> memberProfiles = profileGateway.findAllByUserIds(memberUserIds);

        String prompt = buildPrompt(trip, requesterProfile, memberProfiles, input);

        String planJson = aiPlannerGateway.generateTripPlan(prompt);

        AiTripPlan saved = aiTripPlanGateway.findByTripId(tripId)
                .map(existing -> {
                    existing.setPlanJson(planJson);
                    existing.setGeneratedByUserId(currentUserId);
                    existing.setUpdatedAt(LocalDateTime.now());
                    return aiTripPlanGateway.save(existing);
                })
                .orElseGet(() -> {
                    AiTripPlan newPlan = aiTripPlanMapper.toDomain(tripId, currentUserId, planJson);
                    return aiTripPlanGateway.save(newPlan);
                });

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

        String activities = crewProfiles.stream()
                .filter(p -> p.getActivities() != null)
                .flatMap(p -> p.getActivities().stream())
                .distinct().limit(5)
                .collect(Collectors.joining(", "));

        String languages = crewProfiles.stream()
                .filter(p -> p.getLanguages() != null)
                .flatMap(p -> p.getLanguages().stream())
                .distinct().limit(3)
                .collect(Collectors.joining(", "));

        String userExtra = (input.userPrompt() != null && !input.userPrompt().isBlank())
                ? input.userPrompt().trim()
                : "";

        return String.format(
                "You are a local travel expert. Create a personalized trip itinerary.\n\n" +
                        "TRIP: %s, %s | %d days | %s budget | %s\n" +
                        "GROUP: %d travelers | interests: %s | languages: %s\n" +
                        "%s\n\n" +
                        "Guidelines:\n" +
                        "- Mix iconic spots with hidden local gems\n" +
                        "- Match activities to the group interests and budget\n" +
                        "- Add a practical insider tip per activity\n" +
                        "- Keep descriptions vivid but concise (max 15 words)\n" +
                        "- 2-3 activities per day max\n\n" +
                        "Reply ONLY with valid JSON, no text outside it:\n" +
                        "{" +
                        "\"title\":\"creative itinerary title\"," +
                        "\"summary\":\"2 sentence engaging overview of this trip experience\"," +
                        "\"estimatedBudgetPerPerson\":\"realistic range e.g. 300-500 EUR\"," +
                        "\"days\":[{" +
                        "\"dayNumber\":1," +
                        "\"theme\":\"evocative day theme\"," +
                        "\"activities\":[{" +
                        "\"time\":\"Morning\"," +
                        "\"name\":\"specific place or experience name\"," +
                        "\"description\":\"vivid one sentence description\"," +
                        "\"estimatedCost\":\"e.g. Free or 15 EUR\"," +
                        "\"tip\":\"practical insider tip locals know\"" +
                        "}]" +
                        "}]," +
                        "\"generalTips\":[\"practical tip 1\",\"practical tip 2\",\"practical tip 3\"]," +
                        "\"neighborhoods\":[\"neighborhood 1\",\"neighborhood 2\"]" +
                        "}",
                trip.getDestinationCity(),
                trip.getDestinationCountry(),
                tripDays,
                formatEnum(trip.getBudget()),
                formatEnum(trip.getTripType()),
                crewProfiles.size(),
                activities.isEmpty() ? "general sightseeing" : activities,
                languages.isEmpty() ? "English" : languages,
                userExtra.isEmpty() ? "" : "Special request: " + userExtra
        );
    }

    private String formatEnum(Enum<?> e) {
        if (e == null) return "not specified";
        return e.name().replace("_", " ").toLowerCase();
    }
}