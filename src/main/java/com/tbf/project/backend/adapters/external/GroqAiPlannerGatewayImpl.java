package com.tbf.project.backend.adapters.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tbf.project.backend.entities.gateway.AiPlannerGateway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GroqAiPlannerGatewayImpl implements AiPlannerGateway {

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.3-70b-versatile";

    @Value("${groq.api.key}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<Integer, String> responseCache = new ConcurrentHashMap<>();

    @Override
    public String generateTripPlan(String prompt) {
        int cacheKey = prompt.hashCode();

        if (responseCache.containsKey(cacheKey)) {
            return responseCache.get(cacheKey);
        }

        try {
            String requestBody = buildRequestBody(prompt);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GROQ_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Groq API error: HTTP " + response.statusCode() + " — " + response.body());
            }

            String planJson = extractPlanJson(response.body());
            responseCache.put(cacheKey, planJson);
            return planJson;

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Groq API", e);
        }
    }

    private String buildRequestBody(String prompt) throws Exception {
        var root = objectMapper.createObjectNode();
        root.put("model", MODEL);
        root.put("temperature", 0.3);
        root.put("max_tokens", 2000);

        var messages = root.putArray("messages");

        var system = messages.addObject();
        system.put("role", "system");
        system.put("content", "You are a travel planner. You respond ONLY with valid JSON. No markdown, no explanation, no text before or after the JSON object.");

        var user = messages.addObject();
        user.put("role", "user");
        user.put("content", prompt);

        return objectMapper.writeValueAsString(root);
    }

    private String extractPlanJson(String groqResponse) throws Exception {
        JsonNode root = objectMapper.readTree(groqResponse);
        String rawText = root
                .path("choices")
                .path(0)
                .path("message")
                .path("content")
                .asText("");

        if (rawText.isBlank()) {
            throw new RuntimeException("Groq returned empty response");
        }

        String cleaned = rawText.trim();

        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
        }

        try {
            objectMapper.readTree(cleaned);
        } catch (Exception e) {
            throw new RuntimeException("Groq returned invalid JSON. Try again.", e);
        }

        return cleaned;
    }
}