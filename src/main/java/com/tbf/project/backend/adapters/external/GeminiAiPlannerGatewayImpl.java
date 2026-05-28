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
public class GeminiAiPlannerGatewayImpl implements AiPlannerGateway {

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    @Value("${gemini.api.key}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
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
                    .uri(URI.create(GEMINI_URL + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(90))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Gemini API error: HTTP " + response.statusCode() + " — " + response.body());
            }

            String planJson = extractPlanJson(response.body());

            responseCache.put(cacheKey, planJson);

            return planJson;

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Gemini API", e);
        }
    }

    private String buildRequestBody(String prompt) throws Exception {
        var root = objectMapper.createObjectNode();
        var contentsArray = root.putArray("contents");
        var contentNode = contentsArray.addObject();
        var partsArray = contentNode.putArray("parts");
        partsArray.addObject().put("text", prompt);

        var genConfig = root.putObject("generationConfig");
        genConfig.put("temperature", 0.3);
        genConfig.put("maxOutputTokens", 3000);

        return objectMapper.writeValueAsString(root);
    }

    private String extractPlanJson(String geminiResponse) throws Exception {
        JsonNode root = objectMapper.readTree(geminiResponse);
        String rawText = root
                .path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text")
                .asText("");

        if (rawText.isBlank()) {
            // Verifica daca Gemini a oprit generarea din cauza token limit
            String finishReason = root
                    .path("candidates")
                    .path(0)
                    .path("finishReason")
                    .asText("");
            if ("MAX_TOKENS".equals(finishReason)) {
                throw new RuntimeException("Response truncated — increase maxOutputTokens");
            }
            throw new RuntimeException("Gemini returned empty response");
        }

        String cleaned = rawText.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
        }

        try {
            objectMapper.readTree(cleaned);
        } catch (Exception e) {
            throw new RuntimeException("Gemini returned invalid or truncated JSON. Try again.", e);
        }

        return cleaned;
    }
}