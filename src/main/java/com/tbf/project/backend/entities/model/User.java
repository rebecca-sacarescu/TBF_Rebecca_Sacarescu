package com.tbf.project.backend.entities.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class User {
    private Long id;
    private String email;
    private String password;
    private String username;
    private LocalDateTime createdAt;
}
