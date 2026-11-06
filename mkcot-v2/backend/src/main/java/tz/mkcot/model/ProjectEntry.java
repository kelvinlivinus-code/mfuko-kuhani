package tz.mkcot.model;

import java.math.BigDecimal;

/** Fedha za mradi: uwekezaji, mapato au matumizi. */
public class ProjectEntry {
    private String kind;
    private String date;
    private BigDecimal amount;
    private String note;

    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
