package com.tbf.project.backend.entities.model;

import com.tbf.project.backend.entities.model.enums.TripMemberRole;
import com.tbf.project.backend.entities.model.enums.TripMemberStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class TripMember {
    private Long id;
    private Long tripId;
    private Long userId;
    private TripMemberRole role;
    private TripMemberStatus status;
    private LocalDateTime joinedAt;

    public boolean isOwner() {
        return role == TripMemberRole.OWNER;
    }

    public boolean isActive() {
        return status == TripMemberStatus.ACTIVE;
    }
}