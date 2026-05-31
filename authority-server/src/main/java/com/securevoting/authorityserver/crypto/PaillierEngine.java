package com.securevoting.authorityserver.crypto;

import lombok.Data;
import java.math.BigInteger;
import java.security.SecureRandom;

public class PaillierEngine {

    @Data
    public static class KeyPair {
        private BigInteger n;
        private BigInteger g;
        private BigInteger lambda;
        private BigInteger mu;
    }

    public static KeyPair generateKeys(int bitLength) {
        SecureRandom random = new SecureRandom();
        BigInteger p = BigInteger.probablePrime(bitLength / 2, random);
        BigInteger q = BigInteger.probablePrime(bitLength / 2, random);
        
        while (p.equals(q)) {
            q = BigInteger.probablePrime(bitLength / 2, random);
        }
        
        BigInteger n = p.multiply(q);
        BigInteger nSquared = n.multiply(n);
        
        // lambda = lcm(p-1, q-1)
        BigInteger pMinus1 = p.subtract(BigInteger.ONE);
        BigInteger qMinus1 = q.subtract(BigInteger.ONE);
        BigInteger lambda = pMinus1.multiply(qMinus1).divide(pMinus1.gcd(qMinus1));
        
        BigInteger g = n.add(BigInteger.ONE);
        
        // mu = (L(g^lambda mod n^2))^-1 mod n
        BigInteger x = g.modPow(lambda, nSquared);
        BigInteger l = x.subtract(BigInteger.ONE).divide(n);
        BigInteger mu = l.modInverse(n);
        
        KeyPair pair = new KeyPair();
        pair.setN(n);
        pair.setG(g);
        pair.setLambda(lambda);
        pair.setMu(mu);
        return pair;
    }

    public static BigInteger decrypt(BigInteger c, BigInteger lambda, BigInteger mu, BigInteger n) {
        BigInteger nSquared = n.multiply(n);
        BigInteger x = c.modPow(lambda, nSquared);
        BigInteger l = x.subtract(BigInteger.ONE).divide(n);
        return l.multiply(mu).mod(n);
    }
}
