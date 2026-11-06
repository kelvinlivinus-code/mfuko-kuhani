package tz.mkcot.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Basic;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/** Mipangilio ya mfuko (mstari mmoja tu, id = 1). */
@Entity
public class FundSettings {
    @Id
    @JsonIgnore
    private Integer id = 1;
    private String fundName;
    private String branch;
    private BigDecimal entryFee;
    private BigDecimal monthlyFee;
    private BigDecimal interestRate;
    private BigDecimal openingBalance;
    private LocalDate openingDate;
    @JsonIgnore
    @Basic(fetch = FetchType.LAZY)
    private byte[] logo;
    @JsonIgnore
    private String logoType;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private int logoVersion;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private OffsetDateTime updatedAt;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String updatedBy;

    /** Nembo ipo au la: frontend inaonyesha nembo ya kawaida kama haipo. */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public boolean isHasLogo() { return logoType != null; }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getFundName() { return fundName; }
    public void setFundName(String fundName) { this.fundName = fundName; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public BigDecimal getEntryFee() { return entryFee; }
    public void setEntryFee(BigDecimal entryFee) { this.entryFee = entryFee; }
    public BigDecimal getMonthlyFee() { return monthlyFee; }
    public void setMonthlyFee(BigDecimal monthlyFee) { this.monthlyFee = monthlyFee; }
    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }
    public BigDecimal getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }
    public LocalDate getOpeningDate() { return openingDate; }
    public void setOpeningDate(LocalDate openingDate) { this.openingDate = openingDate; }
    public byte[] getLogo() { return logo; }
    public void setLogo(byte[] logo) { this.logo = logo; }
    public String getLogoType() { return logoType; }
    public void setLogoType(String logoType) { this.logoType = logoType; }
    public int getLogoVersion() { return logoVersion; }
    public void setLogoVersion(int logoVersion) { this.logoVersion = logoVersion; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
