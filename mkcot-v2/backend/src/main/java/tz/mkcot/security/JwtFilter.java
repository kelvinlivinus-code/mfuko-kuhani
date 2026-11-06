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

/** Inasoma "Authorization: Bearer ..." na kumweka mtumiaji kwenye ombi. */
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
        if (h != null && h.startsWith("Bearer ")) {
            jwt.userIdFrom(h.substring(7)).flatMap(users::findById).ifPresent(u -> {
                var auth = new UsernamePasswordAuthenticationToken(
                        new CurrentUser(u.getId(), u.getEmail(), u.getRole(), u.getMemberId()), null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole())));
                SecurityContextHolder.getContext().setAuthentication(auth);
            });
        }
        chain.doFilter(req, res);
    }
}
