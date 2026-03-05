package com.tbf.project.backend.application.usecases;
import com.tbf.project.backend.application.dto.ProfileResponseDto;
public interface GetProfileUseCase {
    ProfileResponseDto execute(Long userId);
}