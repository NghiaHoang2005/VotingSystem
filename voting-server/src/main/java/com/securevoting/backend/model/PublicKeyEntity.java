package com.securevoting.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.Data;

@Entity
@Data
public class PublicKeyEntity {
    @Id
    private String id; // usually "CURRENT" or election id
    
    @Lob
    private String nValue; // 2048-bit modulus n
    
    @Lob
    private String gValue; // generator g
}
