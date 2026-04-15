package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.FeedItemResponseDto;

import java.util.List;

public interface GetFeedUseCase {
    List<FeedItemResponseDto> execute(Long currentUserId, int page, int size);
}