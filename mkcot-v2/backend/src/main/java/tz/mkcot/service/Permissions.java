package tz.mkcot.service;

import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tz.mkcot.model.BaseRecord;
import tz.mkcot.model.Roles;
import tz.mkcot.security.CurrentUser;

/**
 * Ruhusa za kila nafasi. Ni zile zile zilizokuwa kwenye toleo la Supabase:
 * kila mtu anaona na kubadilisha sehemu za kazi yake tu, na Msimamizi pekee anafanya yote.
 */
@Service
public class Permissions {
    public static final String SETTINGS = "settings";
    public static final String ABOUT = "about";
    /** Mipangilio na taarifa za mfuko: kila aliyeidhinishwa anaweza kusoma. */
    public static final String CONFIG = "config";

    private static final Set<String> ALL = Set.of("members", "payments", "events", "loans", "projects",
            "cabinet", "meetings", "notices", "ledger", CONFIG);

    private static final Map<String, Set<String>> READ = Map.of(
            Roles.MHAZINI, Set.of("members", "payments", "loans", "projects", "ledger", "events", "cabinet", "notices", CONFIG),
            Roles.MALIPO, Set.of("members", "payments", "cabinet", "notices", CONFIG),
            Roles.KATIBU, Set.of("members", "events", "meetings", "cabinet", "notices", CONFIG),
            Roles.MWANACHAMA, Set.of("members", "payments", "loans", "events", "cabinet", "notices", CONFIG));

    private static final Map<String, Set<String>> WRITE = Map.of(
            Roles.MHAZINI, Set.of("payments", "loans", "projects", "ledger"),
            Roles.MALIPO, Set.of("payments"),
            Roles.KATIBU, Set.of("members", "events", "meetings", "cabinet", "notices", ABOUT));

    /** Makusanyo ambayo Mwanachama anaona kumbukumbu zake mwenyewe tu. */
    private static final Set<String> OWN_ONLY = Set.of("members", "payments", "loans", "events");

    public boolean canRead(CurrentUser u, String col) {
        return switch (u.role()) {
            case Roles.MSIMAMIZI, Roles.MSOMAJI -> ALL.contains(col);
            default -> READ.getOrDefault(u.role(), Set.of()).contains(col);
        };
    }

    public boolean canReadRecord(CurrentUser u, String col, BaseRecord r) {
        if (!canRead(u, col)) {
            return false;
        }
        if (Roles.MWANACHAMA.equals(u.role()) && OWN_ONLY.contains(col)) {
            return u.memberId() != null && u.memberId().equals(r.ownerMemberId());
        }
        return true;
    }

    public boolean canWrite(CurrentUser u, String col) {
        if (Roles.MSIMAMIZI.equals(u.role())) {
            return true;
        }
        return WRITE.getOrDefault(u.role(), Set.of()).contains(col);
    }

    public void requireRead(CurrentUser u, String col) {
        if (!canRead(u, col)) {
            throw forbidden();
        }
    }

    public void requireWrite(CurrentUser u, String col) {
        if (!canWrite(u, col)) {
            throw forbidden();
        }
    }

    public void requireAdmin(CurrentUser u) {
        if (!Roles.MSIMAMIZI.equals(u.role())) {
            throw forbidden();
        }
    }

    public static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Kumbukumbu haipo.");
    }

    public static ResponseStatusException forbidden() {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, "Huna ruhusa ya kufanya hivi kwa nafasi yako. Mwombe msimamizi.");
    }
}
