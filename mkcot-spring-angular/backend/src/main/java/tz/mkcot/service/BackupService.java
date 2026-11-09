package tz.mkcot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tz.mkcot.model.BaseRecord;
import tz.mkcot.security.CurrentUser;

/**
 * Nakala ya data yote (JSON). Muundo ni ule ule wa toleo la zamani:
 * {exportedAt, settings, about, members, payments, events, loans, projects, cabinet, meetings, notices, ledger}
 * kwa hiyo nakala iliyotolewa kwenye tovuti ya Supabase inaweza kuingizwa hapa moja kwa moja.
 */
@Service
public class BackupService {
    private static final Pattern ISO_DATETIME = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}T.*");
    private static final Set<String> META = Set.of("createdAt", "createdBy", "updatedAt", "updatedBy", "created_at", "created_by", "updated_at", "updated_by");

    private final Collections cols;
    private final ConfigService cfg;
    private final ObjectMapper mapper;

    public BackupService(Collections cols, ConfigService cfg, ObjectMapper mapper) {
        this.cols = cols;
        this.cfg = cfg;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> export() {
        Map<String, Object> o = new LinkedHashMap<>();
        o.put("exportedAt", OffsetDateTime.now().toString());
        o.put("settings", cfg.settings());
        o.put("about", cfg.about());
        for (Collections.Col c : cols.all()) {
            o.put(c.name(), c.r().findAll());
        }
        return o;
    }

    /** Inafuta data iliyopo na kuweka iliyo kwenye nakala. Inarudisha idadi ya kumbukumbu kwa kila sehemu. */
    @Transactional
    public Map<String, Integer> importAll(CurrentUser u, JsonNode root) {
        if (root == null || !root.isObject()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faili si nakala sahihi ya MKCOT.");
        }
        boolean any = false;
        for (Collections.Col c : cols.all()) {
            any |= root.has(c.name());
        }
        if (!any) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faili halina kumbukumbu za MKCOT (wanachama, michango...).");
        }
        Map<String, Integer> counts = new LinkedHashMap<>();
        OffsetDateTime base = OffsetDateTime.now();
        for (Collections.Col c : cols.all()) {
            JsonNode arr = root.get(c.name());
            if (arr == null || !arr.isArray()) {
                continue;
            }
            List<BaseRecord> out = new ArrayList<>();
            Set<String> seen = new HashSet<>();
            int i = 0;
            for (JsonNode n : arr) {
                if (!n.isObject()) continue;
                ObjectNode o = clean((ObjectNode) n);
                String id = o.path("id").asText("");
                o.remove("id");
                BaseRecord r;
                try {
                    r = mapper.convertValue(o, c.type());
                } catch (IllegalArgumentException e) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Kumbukumbu ya " + (i + 1) + " kwenye '" + c.name() + "' ina kosa: " + e.getMessage());
                }
                if (id.isBlank() || id.length() > 40 || !seen.add(id)) {
                    id = RecordService.newId();
                    seen.add(id);
                }
                r.setId(id);
                OffsetDateTime t = base.plusNanos(i * 1_000_000L);
                r.setCreatedAt(t);
                r.setCreatedBy(u.id());
                r.setUpdatedAt(t);
                r.setUpdatedBy(u.id());
                out.add(r);
                i++;
            }
            c.r().deleteAllInBatch();
            c.r().flush();
            c.r().saveAll(out);
            counts.put(c.name(), out.size());
        }
        if (root.path("settings").isObject()) {
            ObjectNode s = clean((ObjectNode) root.get("settings"));
            s.remove("logoId");
            s.remove("hasLogo");
            s.remove("logoVersion");
            cfg.saveSettings(u.id(), s);
        }
        if (root.path("about").isObject()) {
            cfg.saveAbout(u.id(), clean((ObjectNode) root.get("about")));
        }
        return counts;
    }

    /** Tarehe zenye saa ("2024-03-01T10:00:00Z") zinakatwa kuwa tarehe tu; sehemu za kumbukumbu za mfumo zinaondolewa. */
    private ObjectNode clean(ObjectNode n) {
        ObjectNode o = n.deepCopy();
        META.forEach(o::remove);
        Iterator<Map.Entry<String, JsonNode>> it = o.fields();
        List<String> dates = new ArrayList<>();
        while (it.hasNext()) {
            var e = it.next();
            if (e.getValue().isTextual() && ISO_DATETIME.matcher(e.getValue().asText()).matches()) {
                dates.add(e.getKey());
            }
        }
        for (String k : dates) {
            o.put(k, o.get(k).asText().substring(0, 10));
        }
        return o;
    }
}
