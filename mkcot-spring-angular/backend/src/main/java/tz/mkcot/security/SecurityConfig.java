package tz.mkcot.security;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Usalama wa HTTP:
 *  - API zote zinahitaji tokeni isipokuwa kuingia/kujisajili/hali/nembo/afya
 *  - hakuna session wala cookie (stateless JWT), hivyo CSRF haihitajiki
 *  - vichwa vya usalama: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
 *  - CORS inaruhusu anwani zilizotajwa kwenye MKCOT_CORS_ORIGINS tu
 */
@Configuration
public class SecurityConfig {

    /** Content-Security-Policy: kurasa zinapakia msimbo kutoka seva hii tu (na fonti za Google). */
    static final String CSP = String.join("; ",
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: blob:",
            "connect-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'");

    @Bean
    SecurityFilterChain api(HttpSecurity http, JwtFilter jwtFilter, RateLimitFilter rateLimit,
                            @Value("${mkcot.csp-extra-connect:}") String extraConnect) throws Exception {
        String csp = extraConnect.isBlank() ? CSP : CSP.replace("connect-src 'self'", "connect-src 'self' " + extraConnect);
        http.csrf(c -> c.disable())
            .cors(c -> {})
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .httpBasic(b -> b.disable())
            .formLogin(f -> f.disable())
            .logout(l -> l.disable())
            .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .headers(h -> h
                .contentSecurityPolicy(c -> c.policyDirectives(csp))
                .frameOptions(f -> f.deny())
                .httpStrictTransportSecurity(s -> s.includeSubDomains(true).maxAgeInSeconds(31536000))
                .referrerPolicy(r -> r.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .addHeaderWriter(new StaticHeadersWriter("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()"))
                .addHeaderWriter(new StaticHeadersWriter("Cross-Origin-Opener-Policy", "same-origin")))
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/status", "/api/config/logo", "/api/health").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll())
            .addFilterBefore(rateLimit, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /** Vichujio hivi vinaendeshwa ndani ya Spring Security tu, si mara mbili na Tomcat. */
    @Bean
    org.springframework.boot.web.servlet.FilterRegistrationBean<JwtFilter> jwtFilterReg(JwtFilter f) {
        var r = new org.springframework.boot.web.servlet.FilterRegistrationBean<>(f);
        r.setEnabled(false);
        return r;
    }

    @Bean
    org.springframework.boot.web.servlet.FilterRegistrationBean<RateLimitFilter> rateLimitReg(RateLimitFilter f) {
        var r = new org.springframework.boot.web.servlet.FilterRegistrationBean<>(f);
        r.setEnabled(false);
        return r;
    }

    /** BCrypt yenye nguvu 12 (inachukua ~0.25s kwa jaribio moja, hivyo kukisia ni polepole sana). */
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${mkcot.cors.origins:http://localhost:4200}") String origins) {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList());
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        c.setAllowCredentials(false);
        c.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/api/**", c);
        return src;
    }
}
