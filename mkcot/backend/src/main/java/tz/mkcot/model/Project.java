package tz.mkcot.model;

import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Kumbukumbu za "projects". */
@Entity
public class Project extends BaseRecord {
    private String name;
    private String status;
    private LocalDate startDate;
    private String lead;
    private BigDecimal budget;
    private String description;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<ProjectEntry> entries = new ArrayList<>();

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public String getLead() { return lead; }
    public void setLead(String lead) { this.lead = lead; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<ProjectEntry> getEntries() { return entries; }
    public void setEntries(List<ProjectEntry> entries) { this.entries = entries == null ? new ArrayList<>() : entries; }
}
