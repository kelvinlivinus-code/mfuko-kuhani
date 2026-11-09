package tz.mkcot.model;

import jakarta.persistence.Entity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Kumbukumbu za "meetings". */
@Entity
public class Meeting extends BaseRecord {
    private String title;
    private String kind;
    private LocalDate date;
    private String venue;
    private String chair;
    private String secretary;
    private String agenda;
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> attendees = new ArrayList<>();
    private String resolutions;
    private String minutes;
    private LocalDate nextDate;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public String getChair() { return chair; }
    public void setChair(String chair) { this.chair = chair; }
    public String getSecretary() { return secretary; }
    public void setSecretary(String secretary) { this.secretary = secretary; }
    public String getAgenda() { return agenda; }
    public void setAgenda(String agenda) { this.agenda = agenda; }
    public List<String> getAttendees() { return attendees; }
    public void setAttendees(List<String> attendees) { this.attendees = attendees == null ? new ArrayList<>() : attendees; }
    public String getResolutions() { return resolutions; }
    public void setResolutions(String resolutions) { this.resolutions = resolutions; }
    public String getMinutes() { return minutes; }
    public void setMinutes(String minutes) { this.minutes = minutes; }
    public LocalDate getNextDate() { return nextDate; }
    public void setNextDate(LocalDate nextDate) { this.nextDate = nextDate; }
}
