package tz.mkcot.config;

import com.fasterxml.jackson.databind.cfg.CoercionAction;
import com.fasterxml.jackson.databind.cfg.CoercionInputShape;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {
    /** Fomu zinatuma "" kwa sehemu tupu: zipokelewe kama tupu (null) badala ya kosa. */
    @Bean
    Jackson2ObjectMapperBuilderCustomizer emptyStringsAsNull() {
        return b -> b.postConfigurer(m -> m.coercionConfigDefaults()
                .setCoercion(CoercionInputShape.EmptyString, CoercionAction.AsNull));
    }
}
