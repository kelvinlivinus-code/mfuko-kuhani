package tz.mkcot.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tz.mkcot.repo.AppUserRepository;

/**
 * Inasoma "Authorization: Bearer ..." na kumweka mtumiaji kwenye ombi.
 * Nafasi (role) inasomwa kwenye database kila ombi, hivyo Msimamizi akibadilisha nafasi au kufuta mtumiaji,
 * mabadiliko yanaanza mara moja. Tokeni yenye toleo (v) la zamani inakataliwa.
 */
@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final AppUserRepository users;

    public JwtFilter(JwtService jwt, AppUserRepository users) {
        this.jwt = jwt;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ") && h.length() < 4096) {
            jwt.parse(h.substring(7)).ifPresent(p -> users.findById(p.userId())
                    .filter(u -> u.getTokenVersion() == p.version())
                    .ifPresent(u -> {
                        var auth = new UsernamePasswordAuthenticationToken(
                                new CurrentUser(u.getId(), u.getEmail(), u.getRole(), u.getMemberId()), null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole())));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }));
        }
        chain.doFilter(req, res);
    }
}
