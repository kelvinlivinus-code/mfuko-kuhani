package tz.mkcot.web;

import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

/** Makosa yanarudishwa kama {"error": "..."} kwa Kiswahili, ili frontend iyaonyeshe moja kwa moja. */
@RestControllerAdvice
public class ApiErrors {

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Map<String, String>> status(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason() == null ? "Kosa" : e.getReason()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException e) {
        var f = e.getBindingResult().getFieldError();
        String msg = f == null ? "Taarifa si sahihi." : switch (f.getField()) {
            case "email" -> "Weka barua pepe sahihi.";
            case "password", "next" -> tz.mkcot.security.PasswordPolicy.RULE;
            default -> "Sehemu '" + f.getField() + "' si sahihi.";
        };
        return ResponseEntity.badRequest().body(Map.of("error", msg));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Map<String, String>> unreadable(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Taarifa zilizotumwa si sahihi (angalia tarehe na kiasi)."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, String>> illegal(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Taarifa zilizotumwa si sahihi (angalia tarehe na kiasi)."));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<Map<String, String>> integrity(DataIntegrityViolationException e) {
        String m = String.valueOf(e.getMostSpecificCause().getMessage());
        String msg = m.contains("member_no_uq") ? "Namba hiyo ya mwanachama tayari inatumika." : "Taarifa hazikukubaliwa na database.";
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", msg));
    }

    /** Kosa lisilotarajiwa: maelezo ya ndani hayatumwi kwa mtumiaji (yanaandikwa kwenye log ya seva tu). */
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> other(Exception e) throws Exception {
        if (e instanceof org.springframework.web.servlet.resource.NoResourceFoundException
                || e instanceof org.springframework.web.HttpRequestMethodNotSupportedException
                || e instanceof org.springframework.security.access.AccessDeniedException
                || e instanceof org.springframework.security.core.AuthenticationException) {
            throw e;
        }
        org.slf4j.LoggerFactory.getLogger(ApiErrors.class).error("Kosa lisilotarajiwa", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Kosa la seva. Jaribu tena baadaye."));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<Map<String, String>> tooBig(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(Map.of("error", "Faili ni kubwa mno."));
    }
}
