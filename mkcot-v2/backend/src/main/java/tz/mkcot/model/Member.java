package tz.mkcot.model;

import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Kumbukumbu za "members". */
@Entity
public class Member extends BaseRecord {
    private String no;
    private String rank;
    private String name;
    private String armyNo;
    private String unit;
    private String phone;
    private LocalDate joinDate;
    private String status;
    private String usaili;
    private LocalDate usailiDate;
    private String address;
    private String kin;
    private String kinPhone;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Dependant> deps = new ArrayList<>();
    private String notes;

    @Override
    public String ownerMemberId() { return getId(); }

    public String getNo() { return no; }
    public void setNo(String no) { this.no = no; }
    public String getRank() { return rank; }
    public void setRank(String rank) { this.rank = rank; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getArmyNo() { return armyNo; }
    public void setArmyNo(String armyNo) { this.armyNo = armyNo; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getUsaili() { return usaili; }
    public void setUsaili(String usaili) { this.usaili = usaili; }
    public LocalDate getUsailiDate() { return usailiDate; }
    public void setUsailiDate(LocalDate usailiDate) { this.usailiDate = usailiDate; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getKin() { return kin; }
    public void setKin(String kin) { this.kin = kin; }
    public String getKinPhone() { return kinPhone; }
    public void setKinPhone(String kinPhone) { this.kinPhone = kinPhone; }
    public List<Dependant> getDeps() { return deps; }
    public void setDeps(List<Dependant> deps) { this.deps = deps == null ? new ArrayList<>() : deps; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
