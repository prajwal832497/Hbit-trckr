// Data Management Layer - User-Specific Storage
const HabitData = {
    STORAGE_KEY_PREFIX: 'habitTrackerData_',

    // Get current user ID
    getCurrentUserId() {
        const authData = JSON.parse(localStorage.getItem('habitTrackerAuth') || '{}');

        // Use Google sub ID if available, otherwise create/use guest ID
        if (authData.sub) {
            return authData.sub;
        } else if (authData.provider === 'guest') {
            // Check if guest has an ID already
            if (!authData.guestId) {
                authData.guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('habitTrackerAuth', JSON.stringify(authData));
            }
            return authData.guestId;
        } else {
            // No authentication yet - use temporary ID
            return 'temp_user';
        }
    },

    // Get user-specific storage key
    getUserStorageKey() {
        const userId = this.getCurrentUserId();
        return this.STORAGE_KEY_PREFIX + userId;
    },

    // Initialize with sample data if empty (ONLY for new users)
    init() {
        const data = this.load();

        // Only initialize sample data for the very first user OR temp users
        const userId = this.getCurrentUserId();
        const isNewUser = !data || (data.habits && data.habits.length === 0);

        // Don't create sample data for authenticated users
        const authData = JSON.parse(localStorage.getItem('habitTrackerAuth') || '{}');
        if (authData.provider && isNewUser) {
            // New authenticated user - start with empty habits
            this.save({ habits: [] });
        } else if (!data && userId === 'temp_user') {
            // Only temp users get sample data for demo
            this.initializeSampleData();
        } else if (!data) {
            // New user - empty habits
            this.save({ habits: [] });
        }
    },

    // Load data from localStorage (user-specific)
    load() {
        try {
            const key = this.getUserStorageKey();
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    },

    // Save data to localStorage (user-specific)
    save(data) {
        try {
            const key = this.getUserStorageKey();
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    },

    // Get all habits
    getHabits() {
        const data = this.load() || { habits: [] };
        return data.habits || [];
    },

    // Get single habit by ID
    getHabit(id) {
        const habits = this.getHabits();
        return habits.find(habit => habit.id === id);
    },

    // Save habits directly (helper method)
    saveHabits(habits) {
        return this.save({ habits });
    },

    // Add new habit
    addHabit(habitData) {
        const habits = this.getHabits();
        const newHabit = {
            id: this.generateId(),
            name: habitData.name,
            type: habitData.type, // 'good' or 'bad'
            icon: habitData.icon,
            createdAt: new Date().toISOString(),
            checkIns: [] // Array of ISO date strings
        };

        habits.push(newHabit);
        this.save({ habits });
        return newHabit;
    },

    // Update existing habit
    updateHabit(id, updates) {
        const habits = this.getHabits();
        const index = habits.findIndex(habit => habit.id === id);

        if (index !== -1) {
            habits[index] = { ...habits[index], ...updates };
            this.save({ habits });
            return habits[index];
        }
        return null;
    },

    // Delete habit
    deleteHabit(id) {
        const habits = this.getHabits();
        const filtered = habits.filter(habit => habit.id !== id);
        this.save({ habits: filtered });
        return true;
    },

    // Add check-in for a habit
    addCheckIn(habitId, date = new Date()) {
        const habit = this.getHabit(habitId);
        if (!habit) return false;

        const dateStr = this.formatDate(date);

        // Check if already checked in today
        if (!habit.checkIns.includes(dateStr)) {
            habit.checkIns.push(dateStr);
            habit.checkIns.sort(); // Keep dates sorted
            this.updateHabit(habitId, { checkIns: habit.checkIns });
            return true;
        }
        return false;
    },

    // Remove check-in for a habit
    removeCheckIn(habitId, date = new Date()) {
        const habit = this.getHabit(habitId);
        if (!habit) return false;

        const dateStr = this.formatDate(date);
        const index = habit.checkIns.indexOf(dateStr);

        if (index !== -1) {
            habit.checkIns.splice(index, 1);
            this.updateHabit(habitId, { checkIns: habit.checkIns });
            return true;
        }
        return false;
    },

    // Check if habit has check-in for specific date
    hasCheckIn(habitId, date = new Date()) {
        const habit = this.getHabit(habitId);
        if (!habit) return false;

        const dateStr = this.formatDate(date);
        return habit.checkIns.includes(dateStr);
    },

    // Utility: Format date to YYYY-MM-DD
    formatDate(date) {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    },

    // Utility: Generate unique ID
    generateId() {
        return 'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Initialize with sample data
    initializeSampleData() {
        const now = new Date();
        const sampleHabits = [
            {
                id: this.generateId(),
                name: 'Morning Exercise',
                type: 'good',
                icon: '🏃',
                createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                checkIns: this.generateSampleCheckIns(30, 0.7)
            },
            {
                id: this.generateId(),
                name: 'Read Books',
                type: 'good',
                icon: '📚',
                createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                checkIns: this.generateSampleCheckIns(60, 0.6)
            },
            {
                id: this.generateId(),
                name: 'Meditation',
                type: 'good',
                icon: '🧘',
                createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                checkIns: this.generateSampleCheckIns(45, 0.8)
            },
            {
                id: this.generateId(),
                name: 'Social Media Scrolling',
                type: 'bad',
                icon: '📱',
                createdAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString(),
                checkIns: this.generateSampleCheckIns(50, 0.4) // Lower is better for bad habits
            }
        ];

        this.save({ habits: sampleHabits });
    },

    // Generate sample check-ins for demo purposes
    generateSampleCheckIns(daysBack, successRate) {
        const checkIns = [];
        const now = new Date();

        for (let i = 0; i < daysBack; i++) {
            if (Math.random() < successRate) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                checkIns.push(this.formatDate(date));
            }
        }

        return checkIns.sort();
    }
};

// Initialize data on load
HabitData.init();
