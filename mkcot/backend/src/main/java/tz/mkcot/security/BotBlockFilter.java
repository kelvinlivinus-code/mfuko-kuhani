package tz.mkcot.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Inazuia search engines na programu za AI (403) kwa kutumia User-Agent.
 * Orodha hii inalingana na robots.txt, nginx.conf na Caddyfile.
 */
@Component
public class BotBlockFilter extends OncePerRequestFilter {
    static final Pattern BOTS = Pattern.compile(
            "(GPTBot|ChatGPT|OAI-SearchBot|ClaudeBot|Claude-Web|Claude-User|Claude-SearchBot|anthropic-ai|GoogleOther|Google-Extended|Googlebot|bingbot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Applebot|CCBot|PerplexityBot|Perplexity-User|Bytespider|Amazonbot|meta-externalagent|meta-externalfetcher|FacebookBot|cohere-ai|cohere-training-data-crawler|MistralAI|DuckAssistBot|Diffbot|YouBot|Omgilibot|ImagesiftBot|Timpibot|AI2Bot|PetalBot|SemrushBot|AhrefsBot|MJ12bot|DataForSeoBot)",
            Pattern.CASE_INSENSITIVE);

    static boolean isBot(String userAgent) {
        return userAgent != null && BOTS.matcher(userAgent).find();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        if (isBot(req.getHeader("User-Agent"))) {
            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        chain.doFilter(req, res);
    }
}
