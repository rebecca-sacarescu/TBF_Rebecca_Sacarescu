package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.ProfileInteraction;

import java.util.List;
import java.util.Optional;

public interface InteractionGateway {

    Optional<ProfileInteraction> findByActorUserIdAndTargetUserId(Long actorUserId, Long targetUserId);

    ProfileInteraction save(ProfileInteraction interaction);

    List<Long> findTargetUserIdsByActorUserId(Long actorUserId);
}