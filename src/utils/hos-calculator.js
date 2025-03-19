class HOSCalculator {
    constructor(currentHoursUsed = 0) {
      this.currentHoursUsed = currentHoursUsed;
      this.drivingHoursLeft = 11 - currentHoursUsed; // 11-hour driving limit (reset after 10h off-duty)
      this.dutyWindowLeft = 14 - currentHoursUsed;   // 14-hour window (reset after 10h off-duty)
      this.cycleHoursLeft = 70 - currentHoursUsed;   // 70-hour/8-day limit (reset after 34h off-duty)
      this.hoursSinceLastBreak = 0;                  // Hours since last 30-minute break
    }
  
    canDrive(hours) {
      if (hours <= 0) return true;
      
      // Check drive time limit
      if (this.drivingHoursLeft <= 0) return false;
      
      // Check 14-hour window
      if (this.dutyWindowLeft <= 0) return false;
      
      // Check if 30-minute break needed (after 8h driving)
      if (this.hoursSinceLastBreak >= 8) return false;
      
      // Check cycle limit
      if (this.cycleHoursLeft <= 0) return false;
      
      // Check if requested time exceeds available time
      return hours <= this.drivingHoursLeft;
    }
  
    addDrivingTime(hours) {
      if (!this.canDrive(hours)) {
        throw new Error("Cannot drive for the specified hours under HOS regulations");
      }
      
      this.drivingHoursLeft -= hours;
      this.dutyWindowLeft -= hours;
      this.cycleHoursLeft -= hours;
      this.hoursSinceLastBreak += hours;
      
      return {
        drivingHoursLeft: this.drivingHoursLeft,
        dutyWindowLeft: this.dutyWindowLeft,
        cycleHoursLeft: this.cycleHoursLeft,
        breakNeeded: this.hoursSinceLastBreak >= 8
      };
    }
  
    addOnDutyTime(hours) {
      if (this.dutyWindowLeft <= 0) {
        throw new Error("14-hour duty window expired");
      }
      
      this.dutyWindowLeft -= hours;
      this.cycleHoursLeft -= hours;
      
      return {
        drivingHoursLeft: this.drivingHoursLeft,
        dutyWindowLeft: this.dutyWindowLeft,
        cycleHoursLeft: this.cycleHoursLeft
      };
    }
  
    takeBreak(hours) {
      // If break is 30+ minutes, reset the break timer
      if (hours >= 0.5) {
        this.hoursSinceLastBreak = 0;
      }
      
      // If break is 10+ hours, reset driving and duty window
      if (hours >= 10) {
        this.drivingHoursLeft = 11;
        this.dutyWindowLeft = 14;
      }
      
      // If break is 34+ hours, reset cycle hours
      if (hours >= 34) {
        this.cycleHoursLeft = 70;
      }
      
      return {
        drivingHoursLeft: this.drivingHoursLeft,
        dutyWindowLeft: this.dutyWindowLeft,
        cycleHoursLeft: this.cycleHoursLeft,
        hoursSinceLastBreak: this.hoursSinceLastBreak
      };
    }
  
    getStatus() {
      return {
        currentHoursUsed: this.currentHoursUsed,
        drivingHoursLeft: this.drivingHoursLeft,
        dutyWindowLeft: this.dutyWindowLeft,
        cycleHoursLeft: this.cycleHoursLeft,
        hoursSinceLastBreak: this.hoursSinceLastBreak,
        needsBreak: this.hoursSinceLastBreak >= 8
      };
    }
  }
  
  export default HOSCalculator;