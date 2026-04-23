package com.tbf.project.backend.entities.model;

import com.tbf.project.backend.entities.model.enums.Budget;
import com.tbf.project.backend.entities.model.enums.TripStatus;
import com.tbf.project.backend.entities.model.enums.TripType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class Trip {
    private Long id;
    private Long ownerUserId;
    private String title;
    private String destinationCity;
    private String destinationCountry;
    private LocalDate startDate;
    private LocalDate endDate;
    private Budget budget;
    private TripType tripType;
    private String description;
    private Integer targetGroupSize;
    private TripStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public boolean isOwnedBy(Long userId) {
        return ownerUserId.equals(userId);
    }

    public boolean isOpen() {
        return status == TripStatus.OPEN;
    }

    public boolean isFull() {
        return status == TripStatus.FULL;
    }
}