package com.govos.core.domain.auth;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository {
    Optional<Role> findByCode(String code);
}
