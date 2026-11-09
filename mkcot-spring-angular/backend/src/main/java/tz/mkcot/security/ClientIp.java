package tz.mkcot.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Anwani ya IP ya mtumiaji. Nyuma ya Caddy/nginx/Render, Spring inasoma X-Forwarded-For
 * (server.forward-headers-strategy=framework), hivyo getRemoteAddr() ni IP halisi ya mtumiaji.
 * Backend isifunguliwe moja kwa moja kwenye mtandao: ipite kwenye proxy pekee.
 */
public final class ClientIp {
    private ClientIp() {}

    public static String of(HttpServletRequest req) {
        String ip = req.getRemoteAddr();
        return ip == null ? "?" : (ip.length() > 64 ? ip.substring(0, 64) : ip);
    }

    public static String current() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes a) {
            return of(a.getRequest());
        }
        return null;
    }
}
