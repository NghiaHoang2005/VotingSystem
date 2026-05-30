package com.securevoting.authorityserver.controller;

import com.securevoting.authorityserver.crypto.PaillierEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigInteger;
import java.util.Base64;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/authority")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthorityController {

    private PaillierEngine.KeyPair currentKeyPair;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final Logger logger = LoggerFactory.getLogger(AuthorityController.class);

    @PostMapping("/setup")
    public ResponseEntity<?> setupElection(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        logger.info("/api/authority/setup called");
        logger.debug("Received Authorization header present: {}", authHeader != null);
        if (!isAuthorized(authHeader)) {
            logger.warn("Unauthorized setup request - header present: {}", authHeader != null);
            return ResponseEntity.status(401).body("Unauthorized");
        }
        // Generate 2048-bit keys
        logger.info("Authorized - generating Paillier keys");
        currentKeyPair = PaillierEngine.generateKeys(2048);
        
        // Push public key to Voting Server
        String votingServerUrl = "http://localhost:8080/api/keys/public";
        Map<String, String> payload = Map.of(
            "n", currentKeyPair.getN().toString(),
            "g", currentKeyPair.getG().toString()
        );
        
        try {
            logger.info("Pushing public key to Voting Server at {}", votingServerUrl);
            logger.debug("Public key n length: {}", currentKeyPair.getN().toString().length());
            restTemplate.postForEntity(votingServerUrl, payload, String.class);
        } catch (Exception e) {
            logger.error("Failed to push public key to Voting Server", e);
            return ResponseEntity.status(500).body("Keys generated but failed to push to Voting Server: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Keys generated and published to Voting Server successfully."));
    }

    @PostMapping("/decrypt")
    public ResponseEntity<?> decryptTally(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                          @RequestBody Map<String, String> payload) {
        logger.info("/api/authority/decrypt called");
        logger.debug("Received Authorization header present: {}", authHeader != null);
        if (!isAuthorized(authHeader)) {
            logger.warn("Unauthorized decrypt request - header present: {}", authHeader != null);
            return ResponseEntity.status(401).body("Unauthorized");
        }
        if (currentKeyPair == null) {
            return ResponseEntity.badRequest().body("Election not setup yet.");
        }
        
        String cipherStr = payload.get("ciphertext");
        if (cipherStr == null) {
            return ResponseEntity.badRequest().body("ciphertext is required");
        }
        
        BigInteger c = new BigInteger(cipherStr);
        BigInteger m = PaillierEngine.decrypt(c, currentKeyPair.getLambda(), currentKeyPair.getMu(), currentKeyPair.getN());
        logger.info("Decryption completed - result length: {}", m.toString().length());
        return ResponseEntity.ok(Map.of("result", m.toString()));
    }

    private boolean isAuthorized(String authHeader) {
        if (authHeader == null) return false;
        String expected = System.getenv("SERVICE_AUTH");
        if (expected == null || expected.isBlank()) {
            // Fallback to demo credential used by VotingServer (encoded Basic)
            String demo = "admin:SecureVoting@2026";
            expected = "Basic " + Base64.getEncoder().encodeToString(demo.getBytes());
        }
        boolean match = authHeader.equals(expected);
        logger.debug("Authorization header matches expected: {}", match);
        return match;
    }
}
