package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.SavedProfile;

import java.util.List;
import java.util.Optional;

public interface SavedProfileGateway {

    SavedProfile save(SavedProfile savedProfile);

    Optional<SavedProfile> findByActorUserIdAndTargetUserId(Long actorUserId, Long targetUserId);

    boolean existsByActorUserIdAndTargetUserId(Long actorUserId, Long targetUserId);

    List<SavedProfile> findAllByActorUserId(Long actorUserId);

    void deleteByActorUserIdAndTargetUserId(Long actorUserId, Long targetUserId);
}