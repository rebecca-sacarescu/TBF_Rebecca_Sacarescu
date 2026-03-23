package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.MyProfileResponseDto;

public interface GetProfileUseCase {
    MyProfileResponseDto execute(Long userId);
}