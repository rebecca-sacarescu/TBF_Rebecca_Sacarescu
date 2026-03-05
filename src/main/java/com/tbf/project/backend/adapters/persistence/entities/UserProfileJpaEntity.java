package com.tbf.project.backend.adapters.persistence.entities;

import com.tbf.project.backend.entities.model.enums.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    private String fullName;
    private LocalDate birthDate;
    private String gender;
    private String originCountry;
    private String originCity;
    private String currentLocation;
    private String profilePictureUrl;
    private String bio;

    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus;

    @Enumerated(EnumType.STRING)
    private SocialBattery socialBattery;

    @Enumerated(EnumType.STRING)
    private PlanningStyle planningStyle;

    @Enumerated(EnumType.STRING)
    private Budget budget;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ProfileAttributeJpaEntity> attributes = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}