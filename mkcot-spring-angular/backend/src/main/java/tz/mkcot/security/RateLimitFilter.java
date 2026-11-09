package tz.mkcot.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Mipaka ya maombi kwa kila IP:
 *  - kuingia: majaribio 10 kwa dakika 5
 *  - kujisajili: 5 kwa saa
 *  - kubadilisha neno la siri: 10 kwa dakika 15
 *  - API nyingine zote: maombi 600 kwa dakika (kuzuia matumizi mabaya)
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private final RateLimiter limiter;

    public RateLimitFilter(RateLimiter limiter) {
        this.limiter = limiter;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        return !req.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String ip = ClientIp.of(req);
        String uri = req.getRequestURI();
        boolean post = "POST".equalsIgnoreCase(req.getMethod());
        boolean ok;
        if (post && uri.equals("/api/auth/login")) {
            ok = limiter.allow("login:" + ip, 10, 5 * 60_000);
        } else if (post && uri.equals("/api/auth/register")) {
            ok = limiter.allow("register:" + ip, 5, 60 * 60_000);
        } else if (post && uri.equals("/api/auth/password")) {
            ok = limiter.allow("password:" + ip, 10, 15 * 60_000);
        } else {
            ok = limiter.allow("api:" + ip, 600, 60_000);
        }
        if (!ok) {
            res.setStatus(429);
            res.setHeader("Retry-After", "300");
            res.setContentType("application/json;charset=UTF-8");
            res.getWriter().write("{\"error\":\"Majaribio mengi mno. Subiri dakika chache kisha ujaribu tena.\"}");
            return;
        }
        chain.doFilter(req, res);
    }
}
