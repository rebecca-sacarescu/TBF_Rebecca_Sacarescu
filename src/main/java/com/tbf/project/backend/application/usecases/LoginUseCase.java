package com.tbf.project.backend.application.usecases;


import com.tbf.project.backend.application.dto.AuthResponseDto;
import com.tbf.project.backend.application.dto.LoginInputDto;

public interface LoginUseCase {
    AuthResponseDto execute(LoginInputDto input);
}