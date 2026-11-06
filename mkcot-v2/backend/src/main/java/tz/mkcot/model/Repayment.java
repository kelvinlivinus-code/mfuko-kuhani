package tz.mkcot.model;

import java.math.BigDecimal;

/** Rejesho moja la mkopo. */
public class Repayment {
    private String date;
    private BigDecimal amount;
    private String receipt;
    private String note;
    private String at;

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getReceipt() { return receipt; }
    public void setReceipt(String receipt) { this.receipt = receipt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getAt() { return at; }
    public void setAt(String at) { this.at = at; }
}
