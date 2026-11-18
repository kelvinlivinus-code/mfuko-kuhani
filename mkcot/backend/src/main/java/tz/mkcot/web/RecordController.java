package tz.mkcot.web;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tz.mkcot.model.BaseRecord;
import tz.mkcot.security.CurrentUser;
import tz.mkcot.service.RecordService;

/**
 * API moja kwa makusanyo yote:
 * members, payments, events, loans, projects, cabinet, meetings, notices, ledger.
 */
@RestController
@RequestMapping("/api/{col:members|payments|events|loans|projects|cabinet|meetings|notices|ledger}")
public class RecordController {
    private final RecordService svc;

    public RecordController(RecordService svc) {
        this.svc = svc;
    }

    @GetMapping
    public List<BaseRecord> list(@PathVariable String col) {
        return svc.list(CurrentUser.get(), col);
    }

    @GetMapping("/{id}")
    public BaseRecord get(@PathVariable String col, @PathVariable String id) {
        return svc.get(CurrentUser.get(), col, id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BaseRecord create(@PathVariable String col, @RequestBody JsonNode body) {
        return svc.create(CurrentUser.get(), col, body);
    }

    @PutMapping("/{id}")
    public BaseRecord update(@PathVariable String col, @PathVariable String id, @RequestBody JsonNode body) {
        return svc.update(CurrentUser.get(), col, id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String col, @PathVariable String id) {
        svc.delete(CurrentUser.get(), col, id);
    }
}
