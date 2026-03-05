package com.tbf.project.backend.adapters.controllers;

import com.tbf.project.backend.application.dto.AuthResponseDto;
import com.tbf.project.backend.application.dto.RegisterInputDto;
import com.tbf.project.backend.application.dto.LoginInputDto;
import com.tbf.project.backend.application.usecases.RegisterUseCase;
import com.tbf.project.backend.application.usecases.LoginUseCase;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    //interfaces (use cases from the application layer)
    //spring injects the implementations created in UseCaseConfig

    private final RegisterUseCase registerUseCase;
    private final LoginUseCase loginUseCase;


    //converting the json to a Dto
    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDto> signup(@Valid @RequestBody RegisterInputDto req) {
        //call use case that performs business rules
        AuthResponseDto response = registerUseCase.execute(req);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginInputDto req) {
        AuthResponseDto response = loginUseCase.execute(req);
        return ResponseEntity.ok(response);
    }
}
