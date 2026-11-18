package tz.mkcot.model;

import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Kumbukumbu za "loans". */
@Entity
public class Loan extends BaseRecord {
    private String no;
    private String memberId;
    private LocalDate date;
    private BigDecimal principal;
    private BigDecimal rate;
    private Integer months;
    private String guarantor;
    private String purpose;
    private String note;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Repayment> repayments = new ArrayList<>();

    @Override
    public String ownerMemberId() { return memberId; }

    public String getNo() { return no; }
    public void setNo(String no) { this.no = no; }
    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public BigDecimal getPrincipal() { return principal; }
    public void setPrincipal(BigDecimal principal) { this.principal = principal; }
    public BigDecimal getRate() { return rate; }
    public void setRate(BigDecimal rate) { this.rate = rate; }
    public Integer getMonths() { return months; }
    public void setMonths(Integer months) { this.months = months; }
    public String getGuarantor() { return guarantor; }
    public void setGuarantor(String guarantor) { this.guarantor = guarantor; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public List<Repayment> getRepayments() { return repayments; }
    public void setRepayments(List<Repayment> repayments) { this.repayments = repayments == null ? new ArrayList<>() : repayments; }
}
