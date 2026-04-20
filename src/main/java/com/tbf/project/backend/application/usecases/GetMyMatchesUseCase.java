package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.MatchResponseDto;

import java.util.List;

public interface GetMyMatchesUseCase {
    List<MatchResponseDto> execute(Long currentUserId);
}