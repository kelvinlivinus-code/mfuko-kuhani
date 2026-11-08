package tz.mkcot.security;

import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Sheria za neno la siri: herufi 8+, liwe na herufi na namba, na lisiwe miongoni mwa yanayojulikana sana. */
public final class PasswordPolicy {
    public static final String RULE = "Neno la siri liwe na herufi 8 au zaidi, likiwa na herufi (a-z) na namba (0-9).";
    private static final Set<String> COMMON = Set.of("password1", "12345678a", "qwerty123", "abc12345", "password123",
            "admin123", "mkcot123", "1q2w3e4r", "passw0rd", "a1234567", "iloveyou1", "tanzania1", "jwtz1234");

    private PasswordPolicy() {}

    public static void check(String pw) {
        if (pw == null || pw.length() < 8 || pw.length() > 100
                || !pw.chars().anyMatch(Character::isLetter)
                || !pw.chars().anyMatch(Character::isDigit)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, RULE);
        }
        if (COMMON.contains(pw.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Neno hilo la siri ni rahisi kukisiwa. Chagua jingine.");
        }
    }
}
