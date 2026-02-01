// Main Application Logic
const HabitTrackerApp = {
    currentView: 'dashboard',
    currentWeek: new Date(),
    currentMonth: new Date(),
    currentYear: new Date().getFullYear(),
    editingHabitId: null,
    deletingHabitId: null,

    // Initialize the app
    init() {
        // Check for first-time user
        const user = UserProfile.init();
        if (!user) {
            this.showWelcomeModal();
        } else {
            this.displayUserGreeting();
        }

        this.setupEventListeners();
        this.renderDashboard();
        this.updateStats();
        UserProfile.updateStats();
    },

    // Setup all event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchView(e.target.closest('.nav-tab').dataset.view));
        });

        // Add habit buttons
        document.getElementById('btnAddHabit').addEventListener('click', () => this.openAddHabitModal());
        document.getElementById('btnAddFirstHabit')?.addEventListener('click', () => this.openAddHabitModal());

        // Modal controls
        document.getElementById('btnCloseModal').addEventListener('click', () => this.closeHabitModal());
        document.getElementById('btnCancelHabit').addEventListener('click', () => this.closeHabitModal());
        document.getElementById('habitForm').addEventListener('submit', (e) => this.handleHabitSubmit(e));

        // Category toggle
        document.getElementById('btnGoodHabit').addEventListener('click', () => this.selectCategory('good'));
        document.getElementById('btnBadHabit').addEventListener('click', () => this.selectCategory('bad'));

        // Icon selection
        document.querySelectorAll('.icon-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectIcon(e.target.closest('.icon-option')));
        });

        // Delete modal
        document.getElementById('btnCloseDeleteModal').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('btnCancelDelete').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('btnConfirmDelete').addEventListener('click', () => this.confirmDelete());

        // Close modals on backdrop click
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });

        // Week navigation
        document.getElementById('btnPrevWeek')?.addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('btnNextWeek')?.addEventListener('click', () => this.navigateWeek(1));

        // Month navigation
        document.getElementById('btnPrevMonth')?.addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('btnNextMonth')?.addEventListener('click', () => this.navigateMonth(1));

        // Year navigation
        document.getElementById('btnPrevYear')?.addEventListener('click', () => this.navigateYear(-1));
        document.getElementById('btnNextYear')?.addEventListener('click', () => this.navigateYear(1));

        // User profile
        document.getElementById('btnProfile')?.addEventListener('click', () => this.openProfileModal());
        document.getElementById('btnCloseProfile')?.addEventListener('click', () => this.closeProfileModal());

        // Welcome modal
        document.getElementById('welcomeForm')?.addEventListener('submit', (e) => this.handleWelcomeSubmit(e));
        document.getElementById('btnGenerateUsername')?.addEventListener('click', () => this.generateUsername());

        // Avatar selection in welcome modal
        document.querySelectorAll('#avatarGrid .avatar-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAvatar(e.target.closest('.avatar-option'), 'avatarGrid'));
        });
    },

    // Switch between views
    switchView(viewName) {
        this.currentView = viewName;

        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === viewName);
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}View`).classList.add('active');

        // Render appropriate view
        switch (viewName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'weekly':
                this.renderWeeklyView();
                break;
            case 'monthly':
                this.renderMonthlyView();
                break;
            case 'yearly':
                this.renderYearlyView();
                break;
        }
    },

    // Render dashboard view
    renderDashboard() {
        const habits = HabitData.getHabits();
        const habitsList = document.getElementById('habitsList');
        const emptyState = document.getElementById('emptyState');

        if (habits.length === 0) {
            habitsList.innerHTML = '';
            emptyState.classList.add('show');
            return;
        }

        emptyState.classList.remove('show');
        habitsList.innerHTML = '';

        habits.forEach(habit => {
            const habitCard = this.createHabitCard(habit);
            habitsList.appendChild(habitCard);
        });

        this.updateStats();
    },

    // Create habit card element
    createHabitCard(habit) {
        const card = document.createElement('div');
        card.className = `habit-card ${habit.type}`;
        card.dataset.habitId = habit.id;

        const currentStreak = StreakCalculator.getCurrentStreak(habit.checkIns, habit.type);
        const longestStreak = StreakCalculator.getLongestStreak(habit.checkIns, habit.type);
        const isCheckedToday = HabitData.hasCheckIn(habit.id);

        const streakLabel = habit.type === 'good' ? 'Day Streak' : 'Days Clean';

        card.innerHTML = `
            <div class="habit-header">
                <div class="habit-info">
                    <div class="habit-icon">${habit.icon}</div>
                    <div class="habit-details">
                        <h3 class="habit-name">${habit.name}</h3>
                        <div class="habit-meta">
                            <span class="habit-streak">
                                🔥 <span class="streak-number">${currentStreak}</span> ${streakLabel}
                            </span>
                            <span class="habit-best">
                                ⭐ Best: ${longestStreak}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="btn-habit-action edit" data-habit-id="${habit.id}" title="Edit habit">
                        ✏️
                    </button>
                    <button class="btn-habit-action delete" data-habit-id="${habit.id}" title="Delete habit">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="habit-heatmap">
                <div id="heatmap-${habit.id}"></div>
            </div>
            
            <div class="habit-checkin">
                <button class="btn-checkin ${isCheckedToday ? 'checked' : ''}" data-habit-id="${habit.id}">
                    <span>${isCheckedToday ? '✓' : '○'}</span>
                    <span>${isCheckedToday ? 'Completed Today' : 'Mark as Done'}</span>
                </button>
            </div>
        `;

        // Add event listeners
        card.querySelector('.btn-habit-action.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditHabitModal(habit.id);
        });

        card.querySelector('.btn-habit-action.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openDeleteModal(habit.id);
        });

        card.querySelector('.btn-checkin').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleCheckIn(habit.id);
        });

        // Render heatmap after card is added to DOM
        setTimeout(() => {
            ChartRenderer.renderYearHeatmap(habit, `heatmap-${habit.id}`);
        }, 0);

        return card;
    },

    // Update today's stats
    updateStats() {
        console.log('🔍 updateStats() called'); // DEBUG

        const habits = HabitData.getHabits();
        console.log('📊 Habits found:', habits.length); // DEBUG

        const today = new Date();

        let completedToday = 0;
        habits.forEach(habit => {
            if (HabitData.hasCheckIn(habit.id, today)) {
                completedToday++;
            }
        });

        const totalHabits = habits.length;
        const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

        console.log('✅ Stats:', { completedToday, totalHabits, completionRate }); // DEBUG

        const completedEl = document.getElementById('todayCompleted');
        const totalEl = document.getElementById('totalHabits');
        const rateEl = document.getElementById('completionRate');

        console.log('🎯 Elements found:', { completedEl, totalEl, rateEl }); // DEBUG

        if (completedEl) completedEl.textContent = completedToday;
        if (totalEl) totalEl.textContent = totalHabits;
        if (rateEl) rateEl.textContent = `${completionRate}%`;

        console.log('✨ Stats updated!'); // DEBUG
    },

    // Toggle check-in for a habit
    toggleCheckIn(habitId) {
        const today = new Date();
        const hasCheckIn = HabitData.hasCheckIn(habitId, today);

        if (hasCheckIn) {
            HabitData.removeCheckIn(habitId, today);
        } else {
            HabitData.addCheckIn(habitId, today);
        }

        // Re-render dashboard to update UI
        this.renderDashboard();
        UserProfile.updateStats();
        this.updateProfileDisplay();
    },

    // Open add habit modal
    openAddHabitModal() {
        this.editingHabitId = null;
        document.getElementById('modalTitle').textContent = 'Add New Habit';
        document.getElementById('saveButtonText').textContent = 'Create Habit';
        document.getElementById('habitForm').reset();

        // Set defaults
        this.selectCategory('good');
        document.querySelector('.icon-option').click();

        document.getElementById('habitModal').classList.add('show');
        document.getElementById('habitName').focus();
    },

    // Open edit habit modal
    openEditHabitModal(habitId) {
        this.editingHabitId = habitId;
        const habit = HabitData.getHabit(habitId);

        if (!habit) return;

        document.getElementById('modalTitle').textContent = 'Edit Habit';
        document.getElementById('saveButtonText').textContent = 'Save Changes';
        document.getElementById('habitName').value = habit.name;

        this.selectCategory(habit.type);

        // Select icon
        document.querySelectorAll('.icon-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.icon === habit.icon);
        });

        document.getElementById('habitModal').classList.add('show');
        document.getElementById('habitName').focus();
    },

    // Close habit modal
    closeHabitModal() {
        document.getElementById('habitModal').classList.remove('show');
        this.editingHabitId = null;
    },

    // Select category
    selectCategory(type) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
    },

    // Select icon
    selectIcon(iconBtn) {
        document.querySelectorAll('.icon-option').forEach(btn => {
            btn.classList.remove('active');
        });
        iconBtn.classList.add('active');
    },

    // Handle habit form submission
    handleHabitSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('habitName').value.trim();
        const type = document.querySelector('.category-btn.active').dataset.type;
        const icon = document.querySelector('.icon-option.active').dataset.icon;

        if (!name) return;

        if (this.editingHabitId) {
            // Update existing habit
            HabitData.updateHabit(this.editingHabitId, { name, type, icon });
        } else {
            // Create new habit
            HabitData.addHabit({ name, type, icon });
        }

        this.closeHabitModal();
        this.renderDashboard();
        UserProfile.updateStats();
        this.updateProfileDisplay();
    },

    // Open delete confirmation modal
    openDeleteModal(habitId) {
        this.deletingHabitId = habitId;
        document.getElementById('deleteModal').classList.add('show');
    },

    // Close delete modal
    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('show');
        this.deletingHabitId = null;
    },

    // Confirm habit deletion
    confirmDelete() {
        if (this.deletingHabitId) {
            HabitData.deleteHabit(this.deletingHabitId);
            this.closeDeleteModal();
            this.renderDashboard();
            UserProfile.updateStats();
            this.updateProfileDisplay();
        }
    },

    // Show welcome modal for first-time users
    showWelcomeModal() {
        // Generate initial username
        const username = UserProfile.generateUsername();
        document.getElementById('usernameInput').value = username;

        document.getElementById('welcomeModal').classList.add('show');
        document.getElementById('usernameInput').focus();
    },

    // Handle welcome form submission
    handleWelcomeSubmit(e) {
        e.preventDefault();

        const username = document.getElementById('usernameInput').value.trim();
        const selectedAvatar = document.querySelector('#avatarGrid .avatar-option.active');
        const avatar = selectedAvatar ? selectedAvatar.dataset.avatar : '😊';

        if (!username) return;

        // Create user profile
        UserProfile.createUser(username, avatar);

        // Update stats immediately
        UserProfile.updateStats();

        // Close modal
        document.getElementById('welcomeModal').classList.remove('show');

        // Display greeting
        this.displayUserGreeting();

        // Render dashboard
        this.renderDashboard();
    },

    // Generate random username
    generateUsername() {
        const username = UserProfile.generateUsername();
        document.getElementById('usernameInput').value = username;
    },

    // Select avatar
    selectAvatar(avatarBtn, gridId) {
        document.querySelectorAll(`#${gridId} .avatar-option`).forEach(btn => {
            btn.classList.remove('active');
        });
        avatarBtn.classList.add('active');
    },

    // Display user greeting
    displayUserGreeting() {
        const user = UserProfile.getUser();
        if (!user) return;

        const greetingText = UserProfile.getFullGreeting();
        const message = UserProfile.getMotivationalMessage();

        document.getElementById('greetingText').textContent = greetingText;
        document.getElementById('greetingMessage').textContent = message;

        // Update header profile
        document.getElementById('profileAvatar').textContent = user.avatar;
        document.getElementById('profileName').textContent = user.username;
    },

    // Open profile modal
    openProfileModal() {
        // Update stats first to ensure fresh data
        UserProfile.updateStats();

        const user = UserProfile.getUser();
        if (!user) return;

        // Update profile info
        document.getElementById('profileAvatarLarge').textContent = user.avatar;
        document.getElementById('profileUsername').textContent = user.username;
        document.getElementById('userTotalHabits').textContent = user.totalHabits;
        document.getElementById('userTotalCheckIns').textContent = user.totalCheckIns;
        document.getElementById('userLongestStreak').textContent = `${user.longestStreak} 🔥`;
        document.getElementById('userDaysSince').textContent = UserProfile.getDaysSinceJoined();

        // Populate avatar grid in profile modal
        const profileAvatarGrid = document.getElementById('profileAvatarGrid');
        profileAvatarGrid.innerHTML = '';

        UserProfile.avatars.forEach(avatar => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `avatar-option ${avatar === user.avatar ? 'active' : ''}`;
            btn.dataset.avatar = avatar;
            btn.textContent = avatar;
            btn.addEventListener('click', () => this.changeAvatar(avatar, btn));
            profileAvatarGrid.appendChild(btn);
        });

        document.getElementById('profileModal').classList.add('show');
    },

    // Close profile modal
    closeProfileModal() {
        document.getElementById('profileModal').classList.remove('show');
    },

    // Change user avatar
    changeAvatar(avatar, btn) {
        // Update user profile
        UserProfile.updateUser({ avatar: avatar });

        // Update UI
        document.querySelectorAll('#profileAvatarGrid .avatar-option').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');

        // Update displays
        document.getElementById('profileAvatarLarge').textContent = avatar;
        document.getElementById('profileAvatar').textContent = avatar;
    },

    // Update profile display in header
    updateProfileDisplay() {
        const user = UserProfile.getUser();
        if (!user) return;

        document.getElementById('profileAvatar').textContent = user.avatar;
        document.getElementById('profileName').textContent = user.username;
    },

    // Navigate week
    navigateWeek(direction) {
        this.currentWeek.setDate(this.currentWeek.getDate() + (direction * 7));
        this.renderWeeklyView();
    },

    // Navigate month
    navigateMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.renderMonthlyView();
    },

    // Navigate year
    navigateYear(direction) {
        this.currentYear += direction;
        this.renderYearlyView();
    },

    // Render weekly view
    renderWeeklyView() {
        const weekLabel = document.getElementById('weekLabel');
        const weekStart = StreakCalculator.getWeekStart(this.currentWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const formatOptions = { month: 'short', day: 'numeric' };
        weekLabel.textContent = `${weekStart.toLocaleDateString('en-US', formatOptions)} - ${weekEnd.toLocaleDateString('en-US', formatOptions)}`;

        const habits = HabitData.getHabits();
        const container = document.getElementById('weeklyContent');

        if (habits.length === 0) {
            container.innerHTML = '<div class="empty-state show"><div class="empty-icon">📅</div><h3>No habits to display</h3><p>Add some habits to see your weekly progress!</p></div>';
            return;
        }

        container.innerHTML = '';

        habits.forEach(habit => {
            const card = document.createElement('div');
            card.className = `glass-card habit-week-card ${habit.type}`;

            const currentStreak = StreakCalculator.getCurrentStreak(habit.checkIns, habit.type);
            const checkInsInWeek = StreakCalculator.getCheckInsInRange(habit.checkIns, weekStart, weekEnd);
            const completionRate = Math.round((checkInsInWeek.length / 7) * 100);

            card.innerHTML = `
                <div class="habit-week-header">
                    <div class="habit-info">
                        <span class="habit-icon">${habit.icon}</span>
                        <div>
                            <h3 class="habit-name">${habit.name}</h3>
                            <span class="habit-type">${habit.type === 'good' ? 'Good' : 'Bad'} Habit</span>
                        </div>
                    </div>
                    <div class="week-stats">
                        <div class="week-stat">
                            <div class="stat-value">${checkInsInWeek.length}/7</div>
                            <div class="stat-label">Completed</div>
                        </div>
                        <div class="week-stat">
                            <div class="stat-value">${currentStreak} 🔥</div>
                            <div class="stat-label">Streak</div>
                        </div>
                    </div>
                </div>
                <div class="week-grid" id="week-grid-${habit.id}"></div>
            `;

            container.appendChild(card);

            // Render week grid
            this.renderWeekGrid(habit, weekStart, `week-grid-${habit.id}`);
        });
    },

    // Render week grid for a habit
    renderWeekGrid(habit, weekStart, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        container.innerHTML = '';
        container.className = 'week-grid';

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);

            const dateStr = HabitData.formatDate(date);
            const hasCheckIn = habit.checkIns.includes(dateStr);
            const isToday = dateStr === HabitData.formatDate(new Date());

            const dayCard = document.createElement('div');
            dayCard.className = `week-day ${hasCheckIn ? 'completed' : ''} ${isToday ? 'today' : ''}`;

            dayCard.innerHTML = `
                <div class="week-day-label">${weekDays[i]}</div>
                <div class="week-day-number">${date.getDate()}</div>
                <div class="week-day-status">${hasCheckIn ? '✓' : '○'}</div>
            `;

            container.appendChild(dayCard);
        }
    },

    // Render monthly view
    renderMonthlyView() {
        const monthLabel = document.getElementById('monthLabel');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        monthLabel.textContent = `${monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;

        const habits = HabitData.getHabits();
        const container = document.getElementById('monthlyContent');

        if (habits.length === 0) {
            container.innerHTML = '<div class="empty-state show"><div class="empty-icon">📊</div><h3>No habits to display</h3><p>Add some habits to see your monthly statistics!</p></div>';
            return;
        }

        ChartRenderer.renderMonthlyOverview(habits, this.currentMonth.getMonth(), this.currentMonth.getFullYear(), 'monthlyContent');
    },

    // Render yearly view
    renderYearlyView() {
        const yearLabel = document.getElementById('yearLabel');
        yearLabel.textContent = this.currentYear;

        const habits = HabitData.getHabits();
        const container = document.getElementById('yearlyContent');

        if (habits.length === 0) {
            container.innerHTML = '<div class="empty-state show"><div class="empty-icon">📈</div><h3>No habits to display</h3><p>Add some habits to see your yearly trends!</p></div>';
            return;
        }

        container.innerHTML = '<div class="yearly-chart" id="yearlyChart"></div>';
        ChartRenderer.renderYearlyTrend(habits, this.currentYear, 'yearlyChart');
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    HabitData.init();
    HabitTrackerApp.init();
});
