package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.CreateProfileInputDto;
import com.tbf.project.backend.application.dto.ProfileResponseDto;

public interface CreateProfileUseCase {
    ProfileResponseDto execute(Long userId, CreateProfileInputDto input);
}
