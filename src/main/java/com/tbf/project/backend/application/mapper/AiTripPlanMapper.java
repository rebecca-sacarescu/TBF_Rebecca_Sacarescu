package com.tbf.project.backend.application.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tbf.project.backend.application.dto.ActivityDto;
import com.tbf.project.backend.application.dto.AiTripPlanResponseDto;
import com.tbf.project.backend.application.dto.DayPlanDto;
import com.tbf.project.backend.entities.model.AiTripPlan;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AiTripPlanMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiTripPlanResponseDto toDto(AiTripPlan plan, String generatedByName) {
        try {
            JsonNode root = objectMapper.readTree(plan.getPlanJson());

            String title = root.path("title").asText("");
            String summary = root.path("summary").asText("");
            String estimatedBudget = root.path("estimatedBudgetPerPerson").asText("");

            List<DayPlanDto> days = new ArrayList<>();
            JsonNode daysNode = root.path("days");
            if (daysNode.isArray()) {
                for (JsonNode dayNode : daysNode) {
                    int dayNumber = dayNode.path("dayNumber").asInt();
                    String theme = dayNode.path("theme").asText("");
                    List<ActivityDto> activities = new ArrayList<>();
                    JsonNode activitiesNode = dayNode.path("activities");
                    if (activitiesNode.isArray()) {
                        for (JsonNode actNode : activitiesNode) {
                            activities.add(new ActivityDto(
                                    actNode.path("time").asText(""),
                                    actNode.path("name").asText(""),
                                    actNode.path("description").asText(""),
                                    actNode.path("estimatedCost").asText(""),
                                    actNode.path("tip").asText("")
                            ));
                        }
                    }
                    days.add(new DayPlanDto(dayNumber, theme, activities));
                }
            }

            List<String> generalTips = new ArrayList<>();
            JsonNode tipsNode = root.path("generalTips");
            if (tipsNode.isArray()) {
                tipsNode.forEach(t -> generalTips.add(t.asText()));
            }

            List<String> neighborhoods = new ArrayList<>();
            JsonNode neighborhoodsNode = root.path("neighborhoods");
            if (neighborhoodsNode.isArray()) {
                neighborhoodsNode.forEach(n -> neighborhoods.add(n.asText()));
            }

            return new AiTripPlanResponseDto(
                    plan.getTripId(),
                    plan.getGeneratedByUserId(),
                    generatedByName,
                    plan.getUpdatedAt() != null ? plan.getUpdatedAt() : plan.getGeneratedAt(),
                    title,
                    summary,
                    estimatedBudget,
                    days,
                    generalTips,
                    neighborhoods
            );

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse AI plan JSON", e);
        }
    }

    public AiTripPlan toDomain(Long tripId, Long generatedByUserId, String planJson) {
        return AiTripPlan.builder()
                .tripId(tripId)
                .generatedByUserId(generatedByUserId)
                .planJson(planJson)
                .generatedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}