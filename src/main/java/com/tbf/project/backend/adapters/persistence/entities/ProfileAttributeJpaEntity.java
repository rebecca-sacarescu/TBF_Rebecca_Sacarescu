package com.tbf.project.backend.adapters.persistence.entities;

import com.tbf.project.backend.entities.model.enums.AttributeCategory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profile_attributes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileAttributeJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private UserProfileJpaEntity profile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttributeCategory category;

    @Column(name = "attribute_value", nullable = false)
    private String attributeValue;
}