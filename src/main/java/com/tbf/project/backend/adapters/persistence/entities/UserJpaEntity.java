package com.tbf.project.backend.adapters.persistence.entities;
import com.tbf.project.backend.entities.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
//strictly for the database

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String password;

    @Column(unique = true)
    private String username;
    private LocalDateTime createdAt;

    //mapper to convert db entity -> domain entity
    public User toDomain(){
        return User.builder()
                .id(this.id)
                .email(this.email)
                .username(this.username)
                .password(this.password)
                .createdAt(this.createdAt)
                .build();
    }

    //mapper to convert domain entity -> db entity
    public static UserJpaEntity fromDomain(User user){
        return UserJpaEntity.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .password(user.getPassword())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
