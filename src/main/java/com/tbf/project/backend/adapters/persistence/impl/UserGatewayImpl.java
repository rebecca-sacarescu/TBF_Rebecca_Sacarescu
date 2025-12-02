package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.adapters.persistence.entities.UserJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.UserJpaRepository;
import com.tbf.project.backend.entities.gateway.UserGateway;
import com.tbf.project.backend.entities.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Optional;

//mapping the objects manually
@Component
@RequiredArgsConstructor
public class UserGatewayImpl implements UserGateway {

    private final UserJpaRepository userJpaRepository;

    @Override
    public User save(User user){
        UserJpaEntity entity = UserJpaEntity.fromDomain(user);
        UserJpaEntity saved = userJpaRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userJpaRepository.findByEmail(email)
                .map(UserJpaEntity::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userJpaRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userJpaRepository.existsByUsername(username);
    }
}
