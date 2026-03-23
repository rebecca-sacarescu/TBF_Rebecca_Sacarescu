package com.tbf.project.backend.adapters.persistence.impl;

import com.tbf.project.backend.adapters.persistence.entities.ProfileAttributeJpaEntity;
import com.tbf.project.backend.adapters.persistence.entities.UserProfileJpaEntity;
import com.tbf.project.backend.adapters.persistence.repositories.ProfileAttributeJpaRepository;
import com.tbf.project.backend.adapters.persistence.repositories.UserProfileJpaRepository;
import com.tbf.project.backend.entities.gateway.ProfileGateway;
import com.tbf.project.backend.entities.model.UserProfile;
import com.tbf.project.backend.entities.model.enums.AttributeCategory;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProfileGatewayImpl implements ProfileGateway {

    private final UserProfileJpaRepository repository;
    private final ProfileAttributeJpaRepository profileAttributeRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public UserProfile save(UserProfile domain) {
        Optional<UserProfileJpaEntity> existingOptional = repository.findByUserId(domain.getUserId());

        if (existingOptional.isPresent()) {
            Long profileId = existingOptional.get().getId();

            updateExistingProfile(profileId, domain);

            UserProfileJpaEntity refreshed = repository.findById(profileId)
                    .orElseThrow(() -> new IllegalStateException("Profile not found after update for ID: " + profileId));

            return toDomain(refreshed);
        }

        UserProfileJpaEntity entity = toJpaEntity(domain);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());

        UserProfileJpaEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    private void updateExistingProfile(Long profileId, UserProfile domain) {
        profileAttributeRepository.deleteAllByProfileId(profileId);
        entityManager.flush();
        entityManager.clear();

        UserProfileJpaEntity entity = repository.findById(profileId)
                .orElseThrow(() -> new IllegalStateException("Profile not found for ID: " + profileId));

        updateScalarFields(entity, domain);
        entity.setUpdatedAt(LocalDateTime.now());

        entity.getAttributes().clear();

        addAttribute(entity, AttributeCategory.ACTIVITY, domain.getActivities());
        addAttribute(entity, AttributeCategory.DESTINATION_TYPE, domain.getDestinationTypes());
        addAttribute(entity, AttributeCategory.EXPERIENCE_TYPE, domain.getExperienceTypes());
        addAttribute(entity, AttributeCategory.LANGUAGE, domain.getLanguages());
        addAttribute(entity, AttributeCategory.LOOKING_FOR_WHO, domain.getLookingForWho());
        addAttribute(entity, AttributeCategory.LOOKING_FOR_WHAT, domain.getLookingForWhat());

        entityManager.flush();
    }

    @Override
    public Optional<UserProfile> findById(Long userId) {
        return repository.findByUserId(userId).map(this::toDomain);
    }

    @Override
    public boolean existsByUserId(Long userId) {
        return repository.existsByUserId(userId);
    }

    @Override
    public List<UserProfile> findAllExceptUserId(Long userId) {
        return repository.findAllByUserIdNot(userId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private void updateScalarFields(UserProfileJpaEntity entity, UserProfile domain) {
        entity.setUserId(domain.getUserId());
        entity.setFullName(domain.getFullName());
        entity.setBirthDate(domain.getBirthDate());
        entity.setGender(domain.getGender());
        entity.setOriginCountry(domain.getOriginCountry());
        entity.setOriginCity(domain.getOriginCity());
        entity.setCurrentLocation(domain.getCurrentLocation());
        entity.setBio(domain.getBio());
        entity.setProfilePictureUrl(domain.getProfilePictureUrl());
        entity.setVerificationStatus(domain.getVerificationStatus());
        entity.setSocialBattery(domain.getSocialBattery());
        entity.setPlanningStyle(domain.getPlanningStyle());
        entity.setBudget(domain.getBudget());
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
                .attributes(new ArrayList<>())
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
        if (values == null) {
            return;
        }

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