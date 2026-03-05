package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.UserProfile;

import java.util.Optional;

public interface ProfileGateway {

    UserProfile save(UserProfile profile);
    Optional<UserProfile> findById(Long userId);
    boolean existsByUserId(Long userId);
}
