package tz.mkcot.model;

import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Kumbukumbu za "events". */
@Entity
public class SupportEvent extends BaseRecord {
    private String memberId;
    private LocalDate date;
    private String kind;
    private String relation;
    private String person;
    private String place;
    private BigDecimal amount;
    private String status;
    private LocalDate payDate;
    private String approvedBy;
    private String receipt;
    private String description;

    @Override
    public String ownerMemberId() { return memberId; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
    public String getRelation() { return relation; }
    public void setRelation(String relation) { this.relation = relation; }
    public String getPerson() { return person; }
    public void setPerson(String person) { this.person = person; }
    public String getPlace() { return place; }
    public void setPlace(String place) { this.place = place; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getPayDate() { return payDate; }
    public void setPayDate(LocalDate payDate) { this.payDate = payDate; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public String getReceipt() { return receipt; }
    public void setReceipt(String receipt) { this.receipt = receipt; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
