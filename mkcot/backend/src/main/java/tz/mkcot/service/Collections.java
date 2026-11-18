package tz.mkcot.service;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import tz.mkcot.model.*;
import tz.mkcot.repo.*;

/** Orodha ya makusanyo yote ya kumbukumbu, kwa jina linalotumika kwenye API na kwenye nakala (backup). */
@Component
public class Collections {

    public record Col(String name, Class<? extends BaseRecord> type, JpaRepository<? extends BaseRecord, String> repo) {
        @SuppressWarnings("unchecked")
        public JpaRepository<BaseRecord, String> r() {
            return (JpaRepository<BaseRecord, String>) repo;
        }
    }

    private final Map<String, Col> cols = new LinkedHashMap<>();

    public Collections(MemberRepository members, PaymentRepository payments, SupportEventRepository events,
                       LoanRepository loans, ProjectRepository projects, CabinetMemberRepository cabinet,
                       MeetingRepository meetings, NoticeRepository notices, LedgerEntryRepository ledger) {
        add("members", Member.class, members);
        add("payments", Payment.class, payments);
        add("events", SupportEvent.class, events);
        add("loans", Loan.class, loans);
        add("projects", Project.class, projects);
        add("cabinet", CabinetMember.class, cabinet);
        add("meetings", Meeting.class, meetings);
        add("notices", Notice.class, notices);
        add("ledger", LedgerEntry.class, ledger);
    }

    private void add(String n, Class<? extends BaseRecord> t, JpaRepository<? extends BaseRecord, String> r) {
        cols.put(n, new Col(n, t, r));
    }

    public Col get(String name) {
        Col c = cols.get(name);
        if (c == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Hakuna sehemu inayoitwa " + name);
        }
        return c;
    }

    public Iterable<Col> all() {
        return cols.values();
    }
}
