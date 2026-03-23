package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.CreateProfileInputDto;
import com.tbf.project.backend.application.dto.MyProfileResponseDto;

public interface UpdateProfileUseCase {
    MyProfileResponseDto execute(Long userId, CreateProfileInputDto input);
}