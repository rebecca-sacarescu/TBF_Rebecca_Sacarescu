package com.tbf.project.backend.adapters.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Disable CSRF (Essential for APIs/POST requests)
                .csrf(csrf -> csrf.disable())

                // 2. Set Session Management to Stateless (Since we use JWTs)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 3. Define Access Rules
                .authorizeHttpRequests(auth -> auth
                        // Allow anyone to access /auth/login and /auth/signup
                        .requestMatchers("/auth/**").permitAll()
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                 .formLogin(form -> form.disable())

                .httpBasic(httpBasic -> httpBasic.disable());


        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}