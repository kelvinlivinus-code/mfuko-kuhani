package tz.mkcot.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** Inatoa na kukagua tokeni (JWT) za watumiaji walioingia. */
@Service
public class JwtService {
    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private final SecretKey key;
    private final Duration ttl;

    public JwtService(@Value("${mkcot.jwt.secret:}") String secret,
                      @Value("${mkcot.jwt.ttl-hours:12}") long ttlHours) {
        byte[] bytes;
        if (secret == null || secret.isBlank()) {
            bytes = new byte[48];
            new SecureRandom().nextBytes(bytes);
            log.warn("MKCOT_JWT_SECRET haijawekwa: ufunguo wa muda umetengenezwa, kwa hiyo watumiaji watahitaji kuingia upya kila backend ikiwashwa upya.");
        } else {
            bytes = secret.getBytes(StandardCharsets.UTF_8);
            if (bytes.length < 32) {
                throw new IllegalStateException("MKCOT_JWT_SECRET iwe na herufi 32 au zaidi.");
            }
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.ttl = Duration.ofHours(ttlHours);
    }

    public String issue(String userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(key)
                .compact();
    }

    public Optional<String> userIdFrom(String token) {
        try {
            Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            return Optional.ofNullable(c.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    /** Kwa majaribio tu: ufunguo mpya wa nasibu ulio salama. */
    public static String randomSecret() {
        byte[] b = new byte[48];
        new SecureRandom().nextBytes(b);
        return Base64.getEncoder().encodeToString(b);
    }
}
