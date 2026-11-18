package tz.mkcot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tz.mkcot.model.BaseRecord;
import tz.mkcot.model.Loan;
import tz.mkcot.model.Member;
import tz.mkcot.security.CurrentUser;

/** Kusoma, kuongeza, kubadilisha na kufuta kumbukumbu za makusanyo yote, kwa kuzingatia ruhusa. */
@Service
public class RecordService {
    private static final Pattern NUM = Pattern.compile("(\\d+)\\s*$");

    private final Collections cols;
    private final Permissions perms;
    private final ObjectMapper mapper;
    private final AuditService audit;

    public RecordService(Collections cols, Permissions perms, ObjectMapper mapper, AuditService audit) {
        this.cols = cols;
        this.perms = perms;
        this.mapper = mapper;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<BaseRecord> list(CurrentUser u, String col) {
        perms.requireRead(u, col);
        return cols.get(col).r().findAll().stream()
                .filter(r -> perms.canReadRecord(u, col, r))
                .sorted(Comparator.comparing(BaseRecord::getCreatedAt, Comparator.nullsFirst(Comparator.naturalOrder())))
                .toList();
    }

    @Transactional(readOnly = true)
    public BaseRecord get(CurrentUser u, String col, String id) {
        BaseRecord r = cols.get(col).r().findById(id).orElseThrow(Permissions::notFound);
        if (!perms.canReadRecord(u, col, r)) {
            throw Permissions.forbidden();
        }
        return r;
    }

    @Transactional
    public BaseRecord create(CurrentUser u, String col, JsonNode body) {
        perms.requireWrite(u, col);
        Collections.Col c = cols.get(col);
        ObjectNode n = body instanceof ObjectNode o ? o.deepCopy() : mapper.createObjectNode();
        n.remove("id");
        BaseRecord r = mapper.convertValue(n, c.type());
        r.setId(newId());
        OffsetDateTime now = OffsetDateTime.now();
        r.setCreatedAt(now);
        r.setCreatedBy(u.id());
        r.setUpdatedAt(now);
        r.setUpdatedBy(u.id());
        number(c, r);
        validate(r);
        BaseRecord saved = c.r().save(r);
        audit.log(u, "create", col, saved.getId(), null);
        return saved;
    }

    @Transactional
    public BaseRecord update(CurrentUser u, String col, String id, JsonNode body) {
        perms.requireWrite(u, col);
        Collections.Col c = cols.get(col);
        BaseRecord r = c.r().findById(id).orElseThrow(Permissions::notFound);
        ObjectNode n = body instanceof ObjectNode o ? o.deepCopy() : mapper.createObjectNode();
        n.remove("id");
        try {
            mapper.readerForUpdating(r).readValue(n);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Taarifa si sahihi (angalia tarehe na kiasi).");
        }
        r.setId(id);
        r.setUpdatedAt(OffsetDateTime.now());
        r.setUpdatedBy(u.id());
        number(c, r);
        validate(r);
        BaseRecord saved = c.r().save(r);
        audit.log(u, "update", col, id, null);
        return saved;
    }

    @Transactional
    public void delete(CurrentUser u, String col, String id) {
        perms.requireWrite(u, col);
        Collections.Col c = cols.get(col);
        if (!c.r().existsById(id)) {
            throw Permissions.notFound();
        }
        c.r().deleteById(id);
        audit.log(u, "delete", col, id, null);
    }

    public static String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 20);
    }

    /** Namba za mfululizo: COT-001 kwa wanachama, MK001 kwa mikopo (kama kwenye toleo la zamani). */
    private void number(Collections.Col c, BaseRecord r) {
        if (r instanceof Member m && blank(m.getNo())) {
            m.setNo(next(c, "COT-", 3, x -> ((Member) x).getNo()));
        } else if (r instanceof Loan l && blank(l.getNo())) {
            l.setNo(next(c, "MK", 3, x -> ((Loan) x).getNo()));
        }
    }

    private String next(Collections.Col c, String prefix, int width, java.util.function.Function<BaseRecord, String> f) {
        int max = 0;
        for (BaseRecord x : c.r().findAll()) {
            String no = f.apply(x);
            if (no == null) continue;
            Matcher m = NUM.matcher(no);
            if (m.find()) {
                try {
                    max = Math.max(max, Integer.parseInt(m.group(1)));
                } catch (NumberFormatException ignored) {
                    // namba ndefu mno: puuza
                }
            }
        }
        return prefix + String.format("%0" + width + "d", max + 1);
    }

    private void validate(BaseRecord r) {
        if (r instanceof Member m && blank(m.getName())) {
            throw bad("Jina la mwanachama linahitajika.");
        }
        if (r instanceof tz.mkcot.model.Payment p && blank(p.getType())) {
            throw bad("Aina ya malipo inahitajika.");
        }
        if (r instanceof tz.mkcot.model.Project p && blank(p.getName())) {
            throw bad("Jina la mradi linahitajika.");
        }
        if (r instanceof tz.mkcot.model.Notice n && blank(n.getTitle())) {
            throw bad("Kichwa cha tangazo kinahitajika.");
        }
        if (r instanceof tz.mkcot.model.LedgerEntry e && blank(e.getDir())) {
            e.setDir("out");
        }
        if (r instanceof tz.mkcot.model.LedgerEntry e && !"in".equals(e.getDir()) && !"out".equals(e.getDir())) {
            throw bad("Mwelekeo uwe 'in' (mapato) au 'out' (matumizi).");
        }
    }

    static boolean blank(String s) {
        return s == null || s.isBlank();
    }

    static ResponseStatusException bad(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }
}
