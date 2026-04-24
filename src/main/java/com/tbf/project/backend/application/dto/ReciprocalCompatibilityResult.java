package com.tbf.project.backend.application.dto;

import java.util.List;

public record ReciprocalCompatibilityResult(
        DirectionalCompatibilityResult forward,
        DirectionalCompatibilityResult reverse,
        double reciprocalNormalizedScore,
        int reciprocalScore100,
        List<String> highlights,
        List<String> penaltiesApplied
) {
}