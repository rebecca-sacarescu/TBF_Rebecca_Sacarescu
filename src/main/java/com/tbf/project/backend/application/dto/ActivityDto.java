package com.tbf.project.backend.application.dto;

public record ActivityDto(
        String time,
        String name,
        String description,
        String estimatedCost,
        String tip
) {}