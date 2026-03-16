package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.ProfileResponseDto;
import java.util.List;

public interface GetFeedUseCase {
    List<ProfileResponseDto> execute(Long currentUserId);
}