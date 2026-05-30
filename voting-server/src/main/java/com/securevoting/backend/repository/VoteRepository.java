package com.securevoting.backend.repository;

import com.securevoting.backend.model.VoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoteRepository extends JpaRepository<VoteEntity, Long> {
}
