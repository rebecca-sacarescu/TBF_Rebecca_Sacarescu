package com.tbf.project.backend.entities.gateway;

import com.tbf.project.backend.entities.model.ProfileInteractionEvent;

public interface ProfileInteractionEventGateway {

    ProfileInteractionEvent save(ProfileInteractionEvent event);
}