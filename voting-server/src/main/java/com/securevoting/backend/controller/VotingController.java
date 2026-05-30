package com.securevoting.backend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.securevoting.backend.model.PublicKeyEntity;
import com.securevoting.backend.service.VotingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Base64;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class VotingController {

    private static final Logger logger = LoggerFactory.getLogger(VotingController.class);

    private final VotingService votingService;

    public VotingController(VotingService votingService) {
        this.votingService = votingService;
    }

    private HttpHeaders getAuthHeaders() {
        return new HttpHeaders();
    }

    @PostMapping("/admin/setup")
    public ResponseEntity<?> proxySetupElection() {
        logger.info("proxySetupElection called - forwarding to Authority");
        try {
            RestTemplate restTemplate = new RestTemplate();
            String authorityUrl = "http://localhost:8081/api/authority/setup";
            HttpHeaders headers = getAuthHeaders();
            logger.debug("Forwarding Authorization header: {}", headers.getFirst("Authorization") != null ? "[present]" : "[missing]");
            HttpEntity<Void> entity = new HttpEntity<>(null, headers);

            ResponseEntity<String> response = restTemplate.exchange(authorityUrl, HttpMethod.POST, entity, String.class);
            logger.info("Authority responded with status {}", response.getStatusCode().value());
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.debug("Authority response body: {}", response.getBody());
                return ResponseEntity.ok(response.getBody());
            } else {
                logger.warn("Authority Server returned non-2xx: {}", response.getStatusCode().value());
                return ResponseEntity.status(500).body("Authority Server returned error status: " + response.getStatusCode().value());
            }
        } catch (Exception e) {
            logger.error("Error communicating with Authority Server", e);
            return ResponseEntity.status(500).body("Error communicating with Authority Server: " + e.getMessage());
        }
    }

    @PostMapping("/keys/public")
    public ResponseEntity<?> setupElection(@RequestBody Map<String, String> payload) {
        logger.info("/keys/public called with payload keys: {}", payload.keySet());
        String nValue = payload.get("n");
        String gValue = payload.get("g");
        if (nValue == null || gValue == null) {
            return ResponseEntity.badRequest().body("n and g are required");
        }
        votingService.savePublicKey(nValue, gValue);
        logger.info("Public key saved (n length={} digits)", nValue.length());
        return ResponseEntity.ok(Map.of("message", "Public key saved and election reset."));
    }

    @GetMapping("/keys/public")
    public ResponseEntity<?> getPublicKey() {
        Optional<PublicKeyEntity> pk = votingService.getPublicKey();
        if (pk.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("n", pk.get().getNValue(), "g", pk.get().getGValue()));
    }

    @PostMapping("/votes")
    public ResponseEntity<?> submitVote(@RequestBody Map<String, List<String>> payload) {
        List<String> ciphertexts = payload.get("ciphertexts");
        if (ciphertexts == null || ciphertexts.isEmpty()) {
            return ResponseEntity.badRequest().body("ciphertexts are required");
        }
        try {
            logger.info("/votes submit with {} ciphertexts", ciphertexts.size());
            votingService.submitVote(ciphertexts);
            logger.debug("Saved ciphertexts: {}", ciphertexts);
            return ResponseEntity.ok(Map.of("message", "Vote submitted successfully."));
        } catch (JsonProcessingException e) {
            logger.error("Error processing vote payload", e);
            return ResponseEntity.internalServerError().body("Error processing vote");
        }
    }

    @GetMapping("/tally/encrypted")
    public ResponseEntity<?> getEncryptedTally() {
        try {
            List<String> tally = votingService.getEncryptedTally();
            return ResponseEntity.ok(Map.of("tally", tally));
        } catch (JsonProcessingException e) {
            return ResponseEntity.internalServerError().body("Error processing tally");
        }
    }

    @GetMapping("/admin/tally")
    public ResponseEntity<?> executeFinalTally() {
        try {
            List<String> encryptedTallyList = votingService.getEncryptedTally();
            logger.info("/admin/tally called - encrypted tally count: {}", encryptedTallyList.size());
            if (encryptedTallyList.isEmpty()) {
                return ResponseEntity.badRequest().body("No votes to tally");
            }
            
            // Assume single candidate (YES/NO) -> 1 ciphertext
            String encryptedTally = encryptedTallyList.get(0);
            
            RestTemplate restTemplate = new RestTemplate();
            String authorityUrl = "http://localhost:8081/api/authority/decrypt";
            Map<String, String> payload = Map.of("ciphertext", encryptedTally);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, getAuthHeaders());
            
            ResponseEntity<Map> response = restTemplate.exchange(authorityUrl, HttpMethod.POST, entity, Map.class);
            logger.info("Authority decrypt response status: {}", response.getStatusCode().value());
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String result = (String) response.getBody().get("result");
                logger.info("Decrypted result from Authority: {}", result);
                return ResponseEntity.ok(Map.of(
                    "encrypted_tally", encryptedTally,
                    "final_yes_votes", result,
                    "total_ballots", votingService.getTotalBallots()
                ));
            } else {
                logger.warn("Authority Server failed to decrypt, status {}", response.getStatusCode().value());
                return ResponseEntity.status(500).body("Authority Server failed to decrypt");
            }
            
        } catch (Exception e) {
            logger.error("Error executing final tally", e);
            return ResponseEntity.status(500).body("Error executing final tally: " + e.getMessage());
        }
    }
}
