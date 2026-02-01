// Chart and Visualization Components
const ChartRenderer = {
    // Render 365-day heatmap grid for a habit
    renderYearHeatmap(habit, containerId) {
        const container = document.getElementById(containerId) || document.querySelector(`#${containerId}`);
        if (!container) return;

        container.innerHTML = '';

        const today = new Date();
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);

        // Create grid for 53 weeks (371 days to cover full year)
        const totalDays = 371;
        const grid = document.createElement('div');
        grid.className = 'heatmap-grid';

        // Generate days from 371 days ago to today
        for (let i = totalDays - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            const dayElement = this.createHeatmapDay(habit, date);
            grid.appendChild(dayElement);
        }

        container.appendChild(grid);
    },

    // Create individual heatmap day square
    createHeatmapDay(habit, date) {
        const day = document.createElement('div');
        day.className = 'heatmap-day';

        const dateStr = HabitData.formatDate(date);
        const hasCheckIn = habit.checkIns.includes(dateStr);

        // Determine intensity level (for visual effect)
        // For good habits: check-in = filled, no check-in = empty
        // For bad habits: check-in = filled (bad), no check-in = empty (good)
        if (hasCheckIn) {
            day.classList.add('level-4'); // Full intensity
        }

        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'heatmap-tooltip';

        const dateFormatted = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        if (habit.type === 'good') {
            tooltip.textContent = hasCheckIn ? `✓ ${dateFormatted}` : `✗ ${dateFormatted}`;
        } else {
            tooltip.textContent = hasCheckIn ? `✗ ${dateFormatted}` : `✓ ${dateFormatted}`;
        }

        day.appendChild(tooltip);

        return day;
    },

    // Render weekly calendar view
    renderWeeklyCalendar(habit, weekStart, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const calendar = document.createElement('div');
        calendar.className = 'weekly-calendar';

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);

            const dateStr = HabitData.formatDate(date);
            const hasCheckIn = habit.checkIns.includes(dateStr);

            const dayCard = document.createElement('div');
            dayCard.className = `week-day-card ${hasCheckIn ? 'completed' : ''}`;

            dayCard.innerHTML = `
                <div class="week-day-label">${weekDays[i]}</div>
                <div class="week-day-number">${date.getDate()}</div>
                <div class="week-day-status">${hasCheckIn ? '✓' : '○'}</div>
            `;

            calendar.appendChild(dayCard);
        }

        container.appendChild(calendar);
    },

    // Render monthly bar chart
    renderMonthlyChart(habits, month, year, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dailyCompletions = Array(daysInMonth).fill(0);

        // Count completions per day
        habits.forEach(habit => {
            habit.checkIns.forEach(dateStr => {
                const date = new Date(dateStr);
                if (date.getFullYear() === year && date.getMonth() === month) {
                    const day = date.getDate() - 1;
                    dailyCompletions[day]++;
                }
            });
        });

        // Create bar chart
        const chart = document.createElement('div');
        chart.className = 'bar-chart';

        const maxCompletions = Math.max(...dailyCompletions, 1);

        dailyCompletions.forEach((count, index) => {
            const bar = document.createElement('div');
            bar.className = 'bar-item';

            const height = (count / maxCompletions) * 100;
            bar.innerHTML = `
                <div class="bar-column" style="height: ${height}%">
                    <span class="bar-value">${count}</span>
                </div>
                <div class="bar-label">${index + 1}</div>
            `;

            chart.appendChild(bar);
        });

        container.appendChild(chart);
    },

    // Render yearly trend chart
    renderYearlyTrend(habits, year, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = Array(12).fill(0);

        // Count total check-ins per month across all habits
        habits.forEach(habit => {
            const monthlyCheckIns = StreakCalculator.getMonthlyCheckIns(habit.checkIns, year);
            monthlyData.forEach((val, idx) => {
                monthlyData[idx] += monthlyCheckIns[idx];
            });
        });

        // Create trend chart
        const chart = document.createElement('div');
        chart.className = 'trend-chart';

        const maxValue = Math.max(...monthlyData, 1);

        monthlyData.forEach((count, index) => {
            const height = (count / maxValue) * 100;

            const bar = document.createElement('div');
            bar.className = 'trend-bar';
            bar.innerHTML = `
                <div class="trend-column" style="height: ${height}%"></div>
                <div class="trend-label">${months[index]}</div>
            `;

            chart.appendChild(bar);
        });

        container.appendChild(chart);
    },

    // Render circular progress ring
    renderProgressRing(percentage, containerId, label) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        container.innerHTML = `
            <div class="progress-ring">
                <svg width="140" height="140">
                    <circle
                        cx="70"
                        cy="70"
                        r="${radius}"
                        fill="transparent"
                        stroke="rgba(255, 255, 255, 0.1)"
                        stroke-width="10"
                    />
                    <circle
                        cx="70"
                        cy="70"
                        r="${radius}"
                        fill="transparent"
                        stroke="url(#gradient)"
                        stroke-width="10"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="${offset}"
                        stroke-linecap="round"
                        transform="rotate(-90 70 70)"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                </svg>
                <div class="progress-label">
                    <div class="progress-value">${Math.round(percentage)}%</div>
                    <div class="progress-text">${label}</div>
                </div>
            </div>
        `;
    },

    // Render weekly calendar heatmap view
    renderWeeklyHeatmap(habits, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        const today = new Date();
        const weekStart = StreakCalculator.getWeekStart(today);

        habits.forEach(habit => {
            const habitCard = document.createElement('div');
            habitCard.className = `habit-week-card ${habit.type}`;

            habitCard.innerHTML = `
                <div class="habit-week-header">
                    <span class="habit-icon">${habit.icon}</span>
                    <span class="habit-name">${habit.name}</span>
                </div>
                <div class="habit-week-grid" id="week-grid-${habit.id}"></div>
            `;

            container.appendChild(habitCard);

            // Render weekly grid for this habit
            this.renderWeeklyCalendar(habit, weekStart, `week-grid-${habit.id}`);
        });
    },

    // Render monthly overview cards
    renderMonthlyOverview(habits, month, year, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);

        habits.forEach(habit => {
            const checkInsInMonth = StreakCalculator.getCheckInsInRange(
                habit.checkIns,
                monthStart,
                monthEnd
            );

            const daysInMonth = monthEnd.getDate();
            const completionRate = (checkInsInMonth.length / daysInMonth) * 100;
            const currentStreak = StreakCalculator.getCurrentStreak(habit.checkIns, habit.type);

            const card = document.createElement('div');
            card.className = `monthly-habit-card ${habit.type}`;

            card.innerHTML = `
                <div class="monthly-habit-header">
                    <span class="habit-icon">${habit.icon}</span>
                    <div class="habit-info">
                        <h3 class="habit-name">${habit.name}</h3>
                        <span class="habit-type">${habit.type === 'good' ? 'Good' : 'Bad'} Habit</span>
                    </div>
                </div>
                <div class="monthly-stats">
                    <div class="monthly-stat">
                        <div class="stat-label">Check-ins</div>
                        <div class="stat-value">${checkInsInMonth.length}</div>
                    </div>
                    <div class="monthly-stat">
                        <div class="stat-label">Completion</div>
                        <div class="stat-value">${Math.round(completionRate)}%</div>
                    </div>
                    <div class="monthly-stat">
                        <div class="stat-label">Streak</div>
                        <div class="stat-value">${currentStreak} 🔥</div>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }
};
