package tz.mkcot.security;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Kizuizi rahisi cha maombi mengi (rate limit) kwenye kumbukumbu ya seva.
 * Kinazuia mashambulizi ya kukisia neno la siri (brute force) na usajili wa roboti.
 */
@Component
public class RateLimiter {
    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    /** Inarudisha true kama ombi linaruhusiwa (bado halijazidi {@code max} ndani ya {@code windowMs}). */
    public boolean allow(String key, int max, long windowMs) {
        long now = System.currentTimeMillis();
        Deque<Long> q = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (q) {
            while (!q.isEmpty() && now - q.peekFirst() > windowMs) {
                q.pollFirst();
            }
            if (q.size() >= max) {
                return false;
            }
            q.addLast(now);
            return true;
        }
    }

    /** Kila dakika 10: futa funguo zisizotumika ili kumbukumbu isijae. */
    @Scheduled(fixedDelay = 600_000)
    public void cleanup() {
        long now = System.currentTimeMillis();
        hits.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                Long last = e.getValue().peekLast();
                return last == null || now - last > 3_600_000;
            }
        });
    }
}
