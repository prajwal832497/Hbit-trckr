// Streak Calculation Engine
const StreakCalculator = {
    // Calculate current streak for a habit
    getCurrentStreak(checkIns, habitType) {
        if (!checkIns || checkIns.length === 0) return 0;

        const sortedDates = [...checkIns].sort().reverse();
        const today = this.getDateString(new Date());
        const yesterday = this.getDateString(this.addDays(new Date(), -1));

        // For good habits: streak continues if checked in today or yesterday
        // For bad habits: streak is days WITHOUT the bad habit
        if (habitType === 'good') {
            return this.calculateGoodHabitStreak(sortedDates, today, yesterday);
        } else {
            return this.calculateBadHabitStreak(sortedDates, today);
        }
    },

    // Calculate streak for good habits (consecutive check-ins)
    calculateGoodHabitStreak(sortedDates, today, yesterday) {
        // Check if the streak is current (either today or yesterday)
        if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
            return 0; // Streak broken
        }

        let streak = 0;
        let expectedDate = sortedDates[0] === today ? today : yesterday;

        for (const dateStr of sortedDates) {
            if (dateStr === expectedDate) {
                streak++;
                expectedDate = this.getDateString(this.addDays(new Date(dateStr), -1));
            } else {
                break;
            }
        }

        return streak;
    },

    // Calculate streak for bad habits (consecutive days WITHOUT the habit)
    calculateBadHabitStreak(sortedDates, today) {
        // If checked in today, streak is 0
        if (sortedDates[0] === today) {
            return 0;
        }

        // Calculate days since last check-in
        if (sortedDates.length === 0) {
            // No check-ins ever - count from app start or arbitrary date
            return 365; // Max out at a year
        }

        const lastCheckIn = new Date(sortedDates[0]);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate - lastCheckIn) / (1000 * 60 * 60 * 24));

        return daysDiff;
    },

    // Get longest streak ever achieved
    getLongestStreak(checkIns, habitType) {
        if (!checkIns || checkIns.length === 0) return 0;

        if (habitType === 'good') {
            return this.findLongestConsecutiveStreak(checkIns);
        } else {
            return this.findLongestGapStreak(checkIns);
        }
    },

    // Find longest consecutive streak in check-ins
    findLongestConsecutiveStreak(checkIns) {
        const sortedDates = [...checkIns].sort();
        let maxStreak = 0;
        let currentStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);
            const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === 1) {
                currentStreak++;
            } else {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
        }

        return Math.max(maxStreak, currentStreak);
    },

    // Find longest gap between check-ins (for bad habits)
    findLongestGapStreak(checkIns) {
        if (checkIns.length === 0) return 365;
        if (checkIns.length === 1) return 0;

        const sortedDates = [...checkIns].sort();
        let maxGap = 0;

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);
            const gap = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24)) - 1;
            maxGap = Math.max(maxGap, gap);
        }

        return maxGap;
    },

    // Get completion rate for a date range
    getCompletionRate(checkIns, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const checkInCount = checkIns.filter(dateStr => {
            const date = new Date(dateStr);
            return date >= start && date <= end;
        }).length;

        return totalDays > 0 ? (checkInCount / totalDays) * 100 : 0;
    },

    // Get check-in data for specific date range
    getCheckInsInRange(checkIns, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return checkIns.filter(dateStr => {
            const date = new Date(dateStr);
            return date >= start && date <= end;
        });
    },

    // Get check-ins per month
    getMonthlyCheckIns(checkIns, year) {
        const monthly = Array(12).fill(0);

        checkIns.forEach(dateStr => {
            const date = new Date(dateStr);
            if (date.getFullYear() === year) {
                monthly[date.getMonth()]++;
            }
        });

        return monthly;
    },

    // Utility: Get date string (YYYY-MM-DD)
    getDateString(date) {
        return date.toISOString().split('T')[0];
    },

    // Utility: Add days to a date
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    // Utility: Get week start (Monday)
    getWeekStart(date) {
        const result = new Date(date);
        const day = result.getDay();
        const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        result.setDate(diff);
        result.setHours(0, 0, 0, 0);
        return result;
    },

    // Utility: Get month start
    getMonthStart(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    },

    // Utility: Get year start
    getYearStart(date) {
        return new Date(date.getFullYear(), 0, 1);
    }
};
