package com.tbf.project.backend.adapters.scheduling;

import com.tbf.project.backend.application.usecases.ExpireTripsUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TripExpirationScheduler {

    private final ExpireTripsUseCase expireTripsUseCase;

    @Scheduled(cron = "0 0 2 * * *")
    public void expireTrips() {
        expireTripsUseCase.execute();
    }
}