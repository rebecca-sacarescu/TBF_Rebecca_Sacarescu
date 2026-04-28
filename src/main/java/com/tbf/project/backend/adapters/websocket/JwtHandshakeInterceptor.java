package com.tbf.project.backend.adapters.websocket;

import com.tbf.project.backend.entities.gateway.TokenGateway;
import com.tbf.project.backend.entities.gateway.UserGateway;
import com.tbf.project.backend.entities.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final TokenGateway tokenGateway;
    private final UserGateway userGateway;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        String token = extractToken(request);

        if (token == null || token.isBlank()) {
            return false;
        }

        try {
            String email = tokenGateway.extractSubject(token);
            Optional<User> user = userGateway.findByEmail(email);

            if (user.isEmpty() || !tokenGateway.isValid(token, user.get().getEmail())) {
                return false;
            }

            attributes.put("userId", user.get().getId());
            attributes.put("userEmail", user.get().getEmail());

            return true;
        } catch (Exception exception) {
            return false;
        }
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {
    }

    private String extractToken(ServerHttpRequest request) {
        String authHeader = request.getHeaders().getFirst("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return UriComponentsBuilder.fromUri(request.getURI())
                .build()
                .getQueryParams()
                .getFirst("token");
    }
}