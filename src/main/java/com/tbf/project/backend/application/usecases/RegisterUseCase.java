package com.tbf.project.backend.application.usecases;

import com.tbf.project.backend.application.dto.AuthResponseDto;
import com.tbf.project.backend.application.dto.RegisterInputDto;

//depends only on the Gateways defined in the Entity layer
//mapper to convert the input dto to the domain model
public interface RegisterUseCase {
    AuthResponseDto execute(RegisterInputDto input);
}
