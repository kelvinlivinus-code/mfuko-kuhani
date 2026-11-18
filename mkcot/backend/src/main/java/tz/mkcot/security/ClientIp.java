package tz.mkcot.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Anwani ya IP ya mtumiaji, kwa rate limit na kumbukumbu za ukaguzi.
 *
 * Mtumiaji anaweza kutuma X-Forwarded-For ya uongo, kwa hiyo haiaminiwi kwa rate limit.
 * Kama seva iko nyuma ya proxy inayoweka header yake yenyewe (Render/Cloudflare: CF-Connecting-IP),
 * weka MKCOT_CLIENT_IP_HEADER=CF-Connecting-IP: proxy hiyo inafuta thamani yoyote aliyotuma mtumiaji.
 * Vinginevyo inatumika getRemoteAddr() (nyuma ya Caddy ni IP halisi, Caddy haiamini X-Forwarded-For ya nje).
 */
public final class ClientIp {
    private static volatile String header = System.getenv().getOrDefault("MKCOT_CLIENT_IP_HEADER", "").trim();

    private ClientIp() {}

    public static String of(HttpServletRequest req) {
        String ip = null;
        if (!header.isEmpty()) {
            String h = req.getHeader(header);
            if (h != null && !h.isBlank()) {
                ip = h.split(",")[0].trim();
            }
        }
        if (ip == null || ip.isEmpty()) {
            ip = req.getRemoteAddr();
        }
        return ip == null ? "?" : (ip.length() > 64 ? ip.substring(0, 64) : ip);
    }

    public static String current() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes a) {
            return of(a.getRequest());
        }
        return null;
    }
}
