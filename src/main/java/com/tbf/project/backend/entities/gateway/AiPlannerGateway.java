package com.tbf.project.backend.entities.gateway;

public interface AiPlannerGateway {
    String generateTripPlan(String prompt);
}