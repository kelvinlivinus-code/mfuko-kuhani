package tz.mkcot.model;

import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Kumbukumbu za "cabinet". */
@Entity
public class CabinetMember extends BaseRecord {
    private String position;
    private String memberId;
    private String name;
    private String phone;
    private LocalDate termStart;
    private LocalDate termEnd;
    private String status;
    private String duties;

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public LocalDate getTermStart() { return termStart; }
    public void setTermStart(LocalDate termStart) { this.termStart = termStart; }
    public LocalDate getTermEnd() { return termEnd; }
    public void setTermEnd(LocalDate termEnd) { this.termEnd = termEnd; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDuties() { return duties; }
    public void setDuties(String duties) { this.duties = duties; }
}
