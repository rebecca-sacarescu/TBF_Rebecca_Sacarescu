package com.tbf.project.backend.entities.model;

import com.tbf.project.backend.entities.model.enums.TripChatMessageType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class TripChatMessage {

    private Long id;
    private Long tripId;
    private Long senderUserId;
    private String content;
    private TripChatMessageType messageType;
    private LocalDateTime createdAt;
    private LocalDateTime editedAt;
    private LocalDateTime deletedAt;

    public boolean isDeleted() {
        return deletedAt != null;
    }
}