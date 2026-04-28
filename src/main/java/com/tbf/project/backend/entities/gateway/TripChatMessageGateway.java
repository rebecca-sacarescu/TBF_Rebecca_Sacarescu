package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.TripChatMessage;

import java.util.List;

public interface TripChatMessageGateway {

    TripChatMessage save(TripChatMessage message);

    List<TripChatMessage> findByTripIdOrderByCreatedAtAscIdAsc(
            Long tripId,
            int page,
            int size
    );
}