package tz.mkcot.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Inatoa na kukagua tokeni (JWT, HMAC-SHA) za watumiaji walioingia.
 * Tokeni ina "v" (token_version ya mtumiaji): neno la siri likibadilishwa, tokeni zote za zamani zinakataliwa.
 */
@Service
public class JwtService {
    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String ISSUER = "mkcot";
    private final SecretKey key;
    private final Duration ttl;

    public record Parsed(String userId, int version) {}

    public JwtService(@Value("${mkcot.jwt.secret:}") String secret,
                      @Value("${mkcot.jwt.ttl-hours:12}") long ttlHours,
                      @Value("${mkcot.production:false}") boolean production) {
        byte[] bytes;
        if (secret == null || secret.isBlank()) {
            if (production) {
                throw new IllegalStateException("MKCOT_JWT_SECRET lazima iwekwe kwenye seva (MKCOT_PRODUCTION=true).");
            }
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

    public String issue(String userId, int version) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(ISSUER)
                .subject(userId)
                .claim("v", version)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(key)
                .compact();
    }

    public Optional<Parsed> parse(String token) {
        try {
            Claims c = Jwts.parser().verifyWith(key).requireIssuer(ISSUER).build().parseSignedClaims(token).getPayload();
            Integer v = c.get("v", Integer.class);
            if (c.getSubject() == null || v == null) {
                return Optional.empty();
            }
            return Optional.of(new Parsed(c.getSubject(), v));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
