package com.securevoting.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class VoteEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Serialized array of ciphertexts (e.g., ["C1_string", "C2_string", "C3_string"])
    @Lob
    private String ciphertextsJson;
}
