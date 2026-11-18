package tz.mkcot.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

/** Mtumiaji aliyeingia kwenye ombi hili. */
public record CurrentUser(String id, String email, String role, String memberId) {

    public static CurrentUser get() {
        var a = SecurityContextHolder.getContext().getAuthentication();
        if (a != null && a.getPrincipal() instanceof CurrentUser u) {
            return u;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Ingia kwanza.");
    }
}
