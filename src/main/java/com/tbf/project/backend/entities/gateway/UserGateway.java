package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.User;

import java.util.Optional;

public interface UserGateway {
    User save(User user);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
