package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.User;

public interface TokenGateway {
    //generates an auth token for a given user
    String generateToken(String subject);

    //extracts the subject (username/email) from a token
    String extractSubject(String token);

    boolean isValid(String token, String subject);
}
