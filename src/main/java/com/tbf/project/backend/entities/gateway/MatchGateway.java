package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.Match;

import java.util.List;
import java.util.Optional;

public interface MatchGateway {

    Optional<Match> findActiveByUserPair(Long userAId, Long userBId);

    Match save(Match match);

    List<Match> findActiveByUserId(Long userId);

    Optional<Match> findActiveByIdAndUserId(Long matchId, Long userId);

    void softDelete(Long matchId);
}