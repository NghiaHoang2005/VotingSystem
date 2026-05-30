package com.securevoting.backend.repository;

import com.securevoting.backend.model.PublicKeyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublicKeyRepository extends JpaRepository<PublicKeyEntity, String> {
}
