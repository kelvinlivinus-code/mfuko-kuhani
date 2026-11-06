package tz.mkcot.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.time.OffsetDateTime;

/** Utangulizi, historia, malengo, kanuni na mawasiliano ya mfuko (mstari mmoja, id = 1). */
@Entity
public class FundAbout {
    @Id
    @JsonIgnore
    private Integer id = 1;
    private String intro;
    private String history;
    private String goals;
    private String rules;
    private String contact;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private OffsetDateTime updatedAt;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String updatedBy;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getIntro() { return intro; }
    public void setIntro(String intro) { this.intro = intro; }
    public String getHistory() { return history; }
    public void setHistory(String history) { this.history = history; }
    public String getGoals() { return goals; }
    public void setGoals(String goals) { this.goals = goals; }
    public String getRules() { return rules; }
    public void setRules(String rules) { this.rules = rules; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
