package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.SavedProfileResponseDto;

import java.util.List;

public interface GetSavedProfilesUseCase {
    List<SavedProfileResponseDto> execute(Long actorUserId);
}