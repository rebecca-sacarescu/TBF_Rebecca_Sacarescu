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

    private final RegisterUseCase registerUseCase;
    private final LoginUseCase loginUseCase;


    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDto> signup(@Valid @RequestBody RegisterInputDto req) {
        AuthResponseDto response = registerUseCase.execute(req);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginInputDto req) {
        AuthResponseDto response = loginUseCase.execute(req);
        return ResponseEntity.ok(response);
    }
}
