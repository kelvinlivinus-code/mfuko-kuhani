package tz.mkcot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tz.mkcot.model.FundAbout;
import tz.mkcot.model.FundSettings;
import tz.mkcot.repo.FundAboutRepository;
import tz.mkcot.repo.FundSettingsRepository;

/** Mipangilio ya mfuko (ada, riba, salio la kuanzia, nembo) na taarifa za mfuko. */
@Service
public class ConfigService {
    private final FundSettingsRepository settings;
    private final FundAboutRepository about;
    private final ObjectMapper mapper;

    public ConfigService(FundSettingsRepository settings, FundAboutRepository about, ObjectMapper mapper) {
        this.settings = settings;
        this.about = about;
        this.mapper = mapper;
    }

    @Transactional
    public FundSettings settings() {
        return settings.findById(1).orElseGet(() -> {
            FundSettings s = new FundSettings();
            s.setId(1);
            fill(s);
            return settings.save(s);
        });
    }

    @Transactional
    public FundAbout about() {
        return about.findById(1).orElseGet(() -> {
            FundAbout a = new FundAbout();
            a.setId(1);
            return about.save(a);
        });
    }

    @Transactional
    public FundSettings saveSettings(String userId, JsonNode body) {
        FundSettings s = settings();
        merge(s, body);
        s.setId(1);
        fill(s);
        s.setUpdatedAt(OffsetDateTime.now());
        s.setUpdatedBy(userId);
        return settings.save(s);
    }

    @Transactional
    public FundAbout saveAbout(String userId, JsonNode body) {
        FundAbout a = about();
        merge(a, body);
        a.setId(1);
        a.setUpdatedAt(OffsetDateTime.now());
        a.setUpdatedBy(userId);
        return about.save(a);
    }

    @Transactional
    public FundSettings saveLogo(String userId, byte[] bytes, String type) {
        FundSettings s = settings();
        s.setLogo(bytes);
        s.setLogoType(type);
        s.setLogoVersion(s.getLogoVersion() + 1);
        s.setUpdatedAt(OffsetDateTime.now());
        s.setUpdatedBy(userId);
        return settings.save(s);
    }

    private void merge(Object target, JsonNode body) {
        ObjectNode n = body instanceof ObjectNode o ? o.deepCopy() : mapper.createObjectNode();
        n.remove("id");
        try {
            mapper.readerForUpdating(target).readValue(n);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Taarifa si sahihi: " + e.getMessage());
        }
    }

    /** Sehemu zisizoruhusiwa kuwa tupu kwenye database zinapewa thamani za kawaida. */
    private static void fill(FundSettings s) {
        if (s.getFundName() == null || s.getFundName().isBlank()) s.setFundName("MKCOT");
        if (s.getBranch() == null || s.getBranch().isBlank()) s.setBranch("Tawi la COT (Chief of Operations and Training), JWTZ");
        if (s.getEntryFee() == null) s.setEntryFee(new BigDecimal("35000"));
        if (s.getMonthlyFee() == null) s.setMonthlyFee(new BigDecimal("10000"));
        if (s.getInterestRate() == null) s.setInterestRate(BigDecimal.ZERO);
        if (s.getOpeningBalance() == null) s.setOpeningBalance(BigDecimal.ZERO);
    }
}
