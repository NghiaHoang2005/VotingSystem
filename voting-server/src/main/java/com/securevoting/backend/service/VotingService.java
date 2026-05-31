package com.securevoting.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.securevoting.backend.model.PublicKeyEntity;
import com.securevoting.backend.model.VoteEntity;
import com.securevoting.backend.repository.PublicKeyRepository;
import com.securevoting.backend.repository.VoteRepository;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class VotingService {
    private static final Logger logger = LoggerFactory.getLogger(VotingService.class);
    
    private final PublicKeyRepository publicKeyRepository;
    private final VoteRepository voteRepository;
    private final ObjectMapper objectMapper;

    public VotingService(PublicKeyRepository publicKeyRepository, VoteRepository voteRepository, ObjectMapper objectMapper) {
        this.publicKeyRepository = publicKeyRepository;
        this.voteRepository = voteRepository;
        this.objectMapper = objectMapper;
    }

    public void savePublicKey(String nValue, String gValue) {
        PublicKeyEntity key = new PublicKeyEntity();
        key.setId("CURRENT");
        key.setNValue(nValue);
        key.setGValue(gValue);
        publicKeyRepository.save(key);
        logger.info("Saved public key (n length={}) and cleared votes", nValue.length());
        // Clear votes when a new election starts
        voteRepository.deleteAll();
    }

    public Optional<PublicKeyEntity> getPublicKey() {
        return publicKeyRepository.findById("CURRENT");
    }

    public void submitVote(List<String> ciphertexts) throws JsonProcessingException {
        logger.info("submitVote called with {} ciphertexts", ciphertexts.size());
        logger.debug("Ciphertexts sample: {}", ciphertexts.size() > 0 ? ciphertexts.get(0) : "[]");
        VoteEntity vote = new VoteEntity();
        vote.setCiphertextsJson(objectMapper.writeValueAsString(ciphertexts));
        voteRepository.save(vote);
    }

    public long getTotalBallots() {
        return voteRepository.count();
    }

    public List<String> getAllVotes() throws JsonProcessingException {
        List<VoteEntity> votes = voteRepository.findAll();
        List<String> ciphertexts = new ArrayList<>();
        for (VoteEntity v : votes) {
            List<String> strList = objectMapper.readValue(v.getCiphertextsJson(), new TypeReference<>() {});
            if (!strList.isEmpty()) {
                ciphertexts.add(strList.get(0));
            }
        }
        return ciphertexts;
    }

    public List<String> getEncryptedTally() throws JsonProcessingException {
        List<VoteEntity> votes = voteRepository.findAll();
        Optional<PublicKeyEntity> pkOpt = getPublicKey();
        
        if (pkOpt.isEmpty() || votes.isEmpty()) {
            return new ArrayList<>(); // No votes or no key
        }
        
        BigInteger n = new BigInteger(pkOpt.get().getNValue());
        BigInteger nSquared = n.multiply(n);
        logger.info("Computing encrypted tally for {} votes, n size={} bits", votes.size(), n.bitLength());
        
        List<String> tallyCiphertexts = new ArrayList<>();
        
        // Deserialize all votes
        List<List<BigInteger>> parsedVotes = new ArrayList<>();
        for (VoteEntity v : votes) {
            List<String> strList = objectMapper.readValue(v.getCiphertextsJson(), new TypeReference<>() {});
            List<BigInteger> bigIntList = strList.stream().map(BigInteger::new).toList();
            parsedVotes.add(bigIntList);
        }
        
        if (parsedVotes.isEmpty()) return new ArrayList<>();
        
        int numCandidates = parsedVotes.get(0).size();
        
        // Homomorphically add votes for each candidate
        for (int i = 0; i < numCandidates; i++) {
            BigInteger sumC = parsedVotes.get(0).get(i);
            for (int j = 1; j < parsedVotes.size(); j++) {
                sumC = sumC.multiply(parsedVotes.get(j).get(i)).mod(nSquared);
            }
            tallyCiphertexts.add(sumC.toString());
        }
        
        return tallyCiphertexts;
    }
}
