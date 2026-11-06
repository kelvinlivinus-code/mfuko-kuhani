package tz.mkcot.model;

import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Kumbukumbu za "payments". */
@Entity
public class Payment extends BaseRecord {
    private String memberId;
    private String type;
    private Integer year;
    private Integer month;
    private BigDecimal amount;
    private LocalDate date;
    private String receipt;
    private String note;

    @Override
    public String ownerMemberId() { return memberId; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getReceipt() { return receipt; }
    public void setReceipt(String receipt) { this.receipt = receipt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
