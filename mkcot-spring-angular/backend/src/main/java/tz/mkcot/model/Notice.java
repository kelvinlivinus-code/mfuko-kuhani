package tz.mkcot.model;

import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Kumbukumbu za "notices". */
@Entity
public class Notice extends BaseRecord {
    private String title;
    private LocalDate date;
    private String pinned;
    private String body;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getPinned() { return pinned; }
    public void setPinned(String pinned) { this.pinned = pinned; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}
