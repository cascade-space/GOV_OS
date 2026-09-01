package com.govos.core.infrastructure.persistence.auth;

import com.govos.core.domain.auth.Role;
import com.govos.core.domain.auth.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaRoleRepositoryImpl implements RoleRepository {

    private final SpringDataRoleRepository springDataRoleRepository;

    @Override
    public Optional<Role> findByCode(String code) {
        return springDataRoleRepository.findByCode(code);
    }
}
