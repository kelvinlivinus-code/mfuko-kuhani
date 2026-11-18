package tz.mkcot.model;

import java.math.BigDecimal;

/** Mtegemezi wa mwanachama (mke/mume, mtoto, mzazi). */
public class Dependant {
    private String name;
    private String relation;
    private String dob;
    private String alive;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRelation() { return relation; }
    public void setRelation(String relation) { this.relation = relation; }
    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }
    public String getAlive() { return alive; }
    public void setAlive(String alive) { this.alive = alive; }
}
