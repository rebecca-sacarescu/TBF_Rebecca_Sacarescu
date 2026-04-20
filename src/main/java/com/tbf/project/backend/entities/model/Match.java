package com.tbf.project.backend.entities.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class Match {
    private Long id;
    private Long user1Id;
    private Long user2Id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    public boolean involvesUser(Long userId) {
        return user1Id.equals(userId) || user2Id.equals(userId);
    }

    public Long getOtherUserId(Long currentUserId) {
        if (user1Id.equals(currentUserId)) {
            return user2Id;
        }
        if (user2Id.equals(currentUserId)) {
            return user1Id;
        }
        throw new IllegalArgumentException("User is not part of this match.");
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }
}