package com.tbf.project.backend.entities.model;

import com.tbf.project.backend.entities.model.enums.TripJoinRequestStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class TripJoinRequest {
    private Long id;
    private Long tripId;
    private Long requesterUserId;
    private String message;
    private TripJoinRequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public boolean isPending() {
        return status == TripJoinRequestStatus.PENDING;
    }
}