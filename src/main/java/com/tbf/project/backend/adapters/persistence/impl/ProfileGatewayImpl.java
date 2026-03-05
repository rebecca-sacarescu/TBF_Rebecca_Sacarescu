package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.adapters.persistence.entities.ProfileAttributeJpaEntity;
import com.tbf.project.backend.adapters.persistence.entities.UserProfileJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.UserProfileJpaRepository;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.model.UserProfile;
import com.tbf.project.backend.entities.model.enums.AttributeCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProfileGatewayImpl implements ProfileGateway {

    private final UserProfileJpaRepository repository;

    @Override
    @Transactional
    public UserProfile save(UserProfile domain) {
        UserProfileJpaEntity entity = toJpaEntity(domain);

        if (repository.existsByUserId(domain.getUserId())) {
            UserProfileJpaEntity existing = repository.findByUserId(domain.getUserId()).get();
            entity.setId(existing.getId());
            entity.setCreatedAt(existing.getCreatedAt());
        } else {
            entity.setCreatedAt(LocalDateTime.now());
        }
        entity.setUpdatedAt(LocalDateTime.now());

        UserProfileJpaEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<UserProfile> findById(Long userId) {
        return repository.findByUserId(userId).map(this::toDomain);
    }

    @Override
    public boolean existsByUserId(Long userId) {
        return repository.existsByUserId(userId);
    }

    private UserProfileJpaEntity toJpaEntity(UserProfile domain) {
        UserProfileJpaEntity entity = UserProfileJpaEntity.builder()
                .userId(domain.getUserId())
                .fullName(domain.getFullName())
                .birthDate(domain.getBirthDate())
                .gender(domain.getGender())
                .originCountry(domain.getOriginCountry())
                .originCity(domain.getOriginCity())
                .currentLocation(domain.getCurrentLocation())
                .bio(domain.getBio())
                .profilePictureUrl(domain.getProfilePictureUrl())
                .verificationStatus(domain.getVerificationStatus())
                .socialBattery(domain.getSocialBattery())
                .planningStyle(domain.getPlanningStyle())
                .budget(domain.getBudget())
                .attributes(new java.util.ArrayList<>())
                .build();

        addAttribute(entity, AttributeCategory.ACTIVITY, domain.getActivities());
        addAttribute(entity, AttributeCategory.DESTINATION_TYPE, domain.getDestinationTypes());
        addAttribute(entity, AttributeCategory.EXPERIENCE_TYPE, domain.getExperienceTypes());
        addAttribute(entity, AttributeCategory.LANGUAGE, domain.getLanguages());
        addAttribute(entity, AttributeCategory.LOOKING_FOR_WHO, domain.getLookingForWho());
        addAttribute(entity, AttributeCategory.LOOKING_FOR_WHAT, domain.getLookingForWhat());

        return entity;
    }

    private void addAttribute(UserProfileJpaEntity entity, AttributeCategory category, List<String> values) {
        if (values == null) return;
        for (String val : values) {
            entity.getAttributes().add(ProfileAttributeJpaEntity.builder()
                    .profile(entity)
                    .category(category)
                    .attributeValue(val)
                    .build());
        }
    }

    private UserProfile toDomain(UserProfileJpaEntity entity) {
        return UserProfile.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .fullName(entity.getFullName())
                .birthDate(entity.getBirthDate())
                .gender(entity.getGender())
                .originCountry(entity.getOriginCountry())
                .originCity(entity.getOriginCity())
                .currentLocation(entity.getCurrentLocation())
                .bio(entity.getBio())
                .profilePictureUrl(entity.getProfilePictureUrl())
                .verificationStatus(entity.getVerificationStatus())
                .socialBattery(entity.getSocialBattery())
                .planningStyle(entity.getPlanningStyle())
                .budget(entity.getBudget())
                // category filtering
                .activities(getValues(entity, AttributeCategory.ACTIVITY))
                .destinationTypes(getValues(entity, AttributeCategory.DESTINATION_TYPE))
                .experienceTypes(getValues(entity, AttributeCategory.EXPERIENCE_TYPE))
                .languages(getValues(entity, AttributeCategory.LANGUAGE))
                .lookingForWho(getValues(entity, AttributeCategory.LOOKING_FOR_WHO))
                .lookingForWhat(getValues(entity, AttributeCategory.LOOKING_FOR_WHAT))
                .build();
    }

    private List<String> getValues(UserProfileJpaEntity entity, AttributeCategory category) {
        return entity.getAttributes().stream()
                .filter(attr -> attr.getCategory() == category)
                .map(ProfileAttributeJpaEntity::getAttributeValue)
                .collect(Collectors.toList());
    }
}